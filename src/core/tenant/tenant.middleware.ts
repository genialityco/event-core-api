import {
  BadRequestException,
  Injectable,
  Logger,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TenantContextService } from './tenant-context.service';

/**
 * Middleware global de resolución de tenant.
 *
 * ORDEN DE RESOLUCIÓN DE organizationId:
 * 1. Header x-organization-id (usuario multi-org cambia contexto explícitamente)
 * 2. Si el usuario tiene UNA SOLA membresía activa → se usa automáticamente
 * 3. bundleId (x-bundle-id header) → SOLO como ayuda de UX, NO es mecanismo de seguridad
 *    - Si el bundleId apunta a una org donde el usuario NO tiene membresía → 401
 *
 * NOTA: bundleId no puede ser considerado seguro porque cualquiera puede enviar ese header.
 * La verificación de membresía activa es la única fuente de autorización real.
 *
 * IMPORTANTE: Para rutas sin token (públicas), el middleware hace next() sin context.
 * Las rutas que requieran tenant context deben estar protegidas con FirebaseAuthGuard.
 */
@Injectable()
export class TenantMiddleware implements NestMiddleware {
  private readonly logger = new Logger(TenantMiddleware.name);

  constructor(
    @InjectModel('User') private readonly userModel: Model<any>,
    @InjectModel('Member') private readonly memberModel: Model<any>,
    @InjectModel('Organization') private readonly orgModel: Model<any>,
    private readonly tenantCtx: TenantContextService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = req.headers.authorization?.split(' ')[1];

    // Sin token → ruta pública, continuar sin contexto
    if (!token) {
      return next();
    }

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    // Buscar usuario en MongoDB por firebaseUid
    const user = (await this.userModel
      .findOne({ firebaseUid: decoded.uid })
      .lean()) as { _id: any; email?: string } | null;

    if (!user) {
      throw new UnauthorizedException(
        'Usuario no registrado en el sistema. Contacta al administrador.',
      );
    }

    const userId = user._id.toString();

    // Resolver organizationId con las 3 estrategias
    const { organizationId, member } = await this.resolveOrganizationId(
      req,
      userId,
    );

    // Setear en req para compatibilidad con código existente (FirebaseAuthGuard, controllers)
    (req as any).user = decoded;
    (req as any).tenantContext = {
      organizationId,
      userId,
      firebaseUid: decoded.uid,
      memberRole: member.role ?? 'attendee',
      memberId: member._id.toString(),
    };

    // Ejecutar el resto del pipeline DENTRO del AsyncLocalStorage
    // Esto garantiza que TenantContextService.organizationId esté disponible
    // en todos los servicios que se ejecuten durante este request
    return new Promise<void>((resolve, reject) => {
      this.tenantCtx.run(
        {
          organizationId,
          userId,
          firebaseUid: decoded.uid,
          memberRole: member.role ?? 'attendee',
          memberId: member._id.toString(),
        },
        () => {
          try {
            next();
            resolve();
          } catch (err) {
            reject(err);
          }
        },
      );
    });
  }

  private async resolveOrganizationId(
    req: Request,
    userId: string,
  ): Promise<{ organizationId: string; member: any }> {
    // ESTRATEGIA 1: Header explícito x-organization-id
    const headerOrgId = req.headers['x-organization-id'] as string;
    if (headerOrgId) {
      if (!/^[0-9a-fA-F]{24}$/.test(headerOrgId)) {
        throw new BadRequestException(
          'El header x-organization-id no es un ObjectId válido',
        );
      }
      // Verificar membresía activa en la org solicitada
      const member = await this.memberModel
        .findOne({
          userId,
          organizationId: headerOrgId,
          memberActive: true,
        })
        .lean();

      if (!member) {
        this.logger.warn({
          message: 'Acceso denegado: sin membresía en la org del header',
          userId,
          organizationId: headerOrgId,
          path: req.path,
        });
        throw new UnauthorizedException(
          'El usuario no tiene membresía activa en esta organización',
        );
      }
      return { organizationId: headerOrgId, member };
    }

    // Obtener todas las membresías activas del usuario
    const memberships = await this.memberModel
      .find({ userId, memberActive: true }, { organizationId: 1, role: 1 })
      .lean();

    if (memberships.length === 0) {
      throw new UnauthorizedException(
        'El usuario no tiene membresías activas en ninguna organización',
      );
    }

    // ESTRATEGIA 2: Una sola membresía → usar automáticamente
    if (memberships.length === 1) {
      return {
        organizationId: memberships[0].organizationId.toString(),
        member: memberships[0],
      };
    }

    // ESTRATEGIA 3: Múltiples membresías + bundleId como ayuda UX (NO seguridad)
    const bundleId = req.headers['x-bundle-id'] as string;
    if (bundleId) {
      const org = (await this.orgModel
        .findOne(
          {
            $or: [
              { 'bundleIds.ios': bundleId },
              { 'bundleIds.android': bundleId },
            ],
          },
          { _id: 1 },
        )
        .lean()) as { _id: any } | null;

      if (org) {
        const orgIdStr = (org._id as any).toString();
        const matchingMember = memberships.find(
          (m) => m.organizationId.toString() === orgIdStr,
        );

        if (matchingMember) {
          return { organizationId: orgIdStr, member: matchingMember };
        }

        // bundleId apunta a org donde el usuario NO tiene membresía → denegar
        this.logger.warn({
          message: 'bundleId apunta a org sin membresía del usuario',
          userId,
          bundleId,
          orgId: orgIdStr,
          path: req.path,
        });
        throw new UnauthorizedException(
          'El usuario no tiene acceso a la organización asociada a esta app',
        );
      }
    }

    // Usuario con múltiples orgs sin forma de resolverlo → error descriptivo
    throw new BadRequestException(
      'Tu cuenta pertenece a múltiples organizaciones. ' +
        'Envía el header x-organization-id para seleccionar la organización activa.',
    );
  }
}
