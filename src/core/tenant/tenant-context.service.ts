import { AsyncLocalStorage } from 'async_hooks';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

export interface TenantContext {
  organizationId: string;
  userId: string;
  firebaseUid: string;
  memberRole: 'admin' | 'staff' | 'attendee';
  memberId: string;
}

@Injectable()
export class TenantContextService {
  private readonly storage = new AsyncLocalStorage<TenantContext>();

  run<T>(context: TenantContext, fn: () => T): T {
    return this.storage.run(context, fn);
  }

  getContext(): TenantContext {
    const ctx = this.storage.getStore();
    if (!ctx) {
      throw new InternalServerErrorException(
        'TenantContext no disponible. Verifica que TenantMiddleware esté registrado para esta ruta.',
      );
    }
    return ctx;
  }

  get organizationId(): string {
    return this.getContext().organizationId;
  }

  get userId(): string {
    return this.getContext().userId;
  }

  get memberId(): string {
    return this.getContext().memberId;
  }

  get memberRole(): string {
    return this.getContext().memberRole;
  }

  /** Retorna true si el contexto está disponible (para rutas donde es opcional) */
  isAvailable(): boolean {
    return this.storage.getStore() !== undefined;
  }
}
