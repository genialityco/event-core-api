import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { BaseTenantRepository } from '../core/database/base-tenant.repository';
import { TenantContextService } from '../core/tenant/tenant-context.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelsService extends BaseTenantRepository<any> {
  constructor(
    @InjectModel('Hotel') hotelModel: Model<any>,
    tenantCtx: TenantContextService,
  ) {
    super(hotelModel, tenantCtx);
  }

  async findByEvent(eventId: string) {
    const hotels = await this.findAll({ eventId: new Types.ObjectId(eventId) } as any);
    return [...hotels].sort(
      (a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0) || a.order - b.order,
    );
  }

  createHotel(dto: CreateHotelDto) {
    return super.create(dto as any);
  }

  updateHotel(id: string, dto: UpdateHotelDto) {
    return super.update(id, dto as any);
  }

  removeHotel(id: string) {
    return super.delete(id);
  }
}
