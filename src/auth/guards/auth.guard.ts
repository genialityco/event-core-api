import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

/**
 * Guard de autenticación Firebase.
 *
 * OPTIMIZACIÓN: Si TenantMiddleware ya verificó el token y seteó request.user,
 * el guard reutiliza ese resultado en lugar de hacer una segunda llamada a Firebase.
 * Esto ocurre en todas las rutas protegidas (las que no están en el exclude del middleware).
 *
 * Si request.user no está (ruta excluida del middleware o llamada directa),
 * el guard hace la verificación completa como antes.
 */
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // TenantMiddleware ya verificó el token — reutilizar sin llamar a Firebase de nuevo
    if (request.user) {
      return true;
    }

    const authorization = request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authorization.split(' ')[1];
    const decodedToken = await this.authService.verifyIdToken(token);

    if (!decodedToken) {
      throw new UnauthorizedException('Invalid token');
    }

    request.user = decodedToken;
    return true;
  }
}
