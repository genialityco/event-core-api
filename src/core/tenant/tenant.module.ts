import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TenantContextService } from './tenant-context.service';
import { TenantMiddleware } from './tenant.middleware';
import { UserSchema } from '../../user/schemas/user.schema';
import { MemberSchema } from '../../member/schemas/member.schema';
import { OrganizationSchema } from '../../organization/schemas/organization.schema';

/**
 * Módulo global de tenant.
 *
 * @Global → TenantContextService disponible en TODOS los módulos sin importar TenantModule.
 * Importa los schemas necesarios para que TenantMiddleware pueda resolver el contexto.
 */
@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'Member', schema: MemberSchema },
      { name: 'Organization', schema: OrganizationSchema },
    ]),
  ],
  providers: [TenantContextService, TenantMiddleware],
  exports: [TenantContextService, TenantMiddleware, MongooseModule],
})
export class TenantModule {}
