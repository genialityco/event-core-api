import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FEATURE_KEY } from '../decorators/feature-required.decorator';
import { TenantContextService } from '../../tenant/tenant-context.service';

/**
 * Guard que verifica si el módulo solicitado está habilitado para la organización activa.
 *
 * - Source of truth: Organization.features en MongoDB (backend siempre manda).
 * - Si el feature no está en Organization.features → 403 Forbidden.
 * - Debe usarse DESPUÉS de FirebaseAuthGuard (requiere tenant context activo).
 *
 * Uso:
 *   @UseGuards(FirebaseAuthGuard, FeatureGuard)
 *   @FeatureRequired('travel')
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tenantCtx: TenantContextService,
    @InjectModel('Organization') private readonly orgModel: Model<any>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const feature = this.reflector.getAllAndOverride<string>(FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Sin decorador → módulo siempre disponible
    if (!feature) return true;

    const org = (await this.orgModel
      .findById(this.tenantCtx.organizationId, { features: 1 })
      .lean()) as { features?: Record<string, boolean> } | null;

    if (!org?.features?.[feature]) {
      throw new ForbiddenException(
        `El módulo '${feature}' no está habilitado para esta organización`,
      );
    }

    return true;
  }
}
