import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseTenantRepository } from '../core/database/base-tenant.repository';
import { TenantContextService } from '../core/tenant/tenant-context.service';
import { CreateUsefulInfoDto } from './dto/create-useful-info.dto';

@Injectable()
export class UsefulInfoService extends BaseTenantRepository<any> {
  constructor(
    @InjectModel('UsefulInfo') model: Model<any>,
    tenantCtx: TenantContextService,
  ) {
    super(model, tenantCtx);
  }

  findByEvent(eventId: string, publishedOnly = true) {
    const filter: any = { eventId: new Types.ObjectId(eventId) };
    if (publishedOnly) filter.isPublished = true;
    return this.findAll(filter);
  }

  createItem(eventId: string, dto: CreateUsefulInfoDto) {
    return super.create({ ...dto, eventId } as any);
  }

  updateItem(id: string, dto: Partial<CreateUsefulInfoDto>) {
    return super.update(id, dto as any);
  }

  removeItem(id: string) {
    return super.delete(id);
  }
}
