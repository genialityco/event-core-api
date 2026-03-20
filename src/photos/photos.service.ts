import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseTenantRepository } from '../core/database/base-tenant.repository';
import { TenantContextService } from '../core/tenant/tenant-context.service';
import { CreatePhotoDto } from './dto/create-photo.dto';

@Injectable()
export class PhotosService extends BaseTenantRepository<any> {
  constructor(
    @InjectModel('Photo') photoModel: Model<any>,
    tenantCtx: TenantContextService,
  ) {
    super(photoModel, tenantCtx);
  }

  findByEvent(eventId: string) {
    return this.findAll({ eventId: new Types.ObjectId(eventId) } as any);
  }

  createPhoto(eventId: string, dto: CreatePhotoDto, userId: string) {
    return super.create({ ...dto, eventId, userId } as any);
  }

  removePhoto(id: string) {
    return super.delete(id);
  }
}
