import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { BaseTenantRepository } from '../core/database/base-tenant.repository';
import { TenantContextService } from '../core/tenant/tenant-context.service';
import { TravelerInfoInterface } from './interfaces/traveler-info.interface';
import { UpsertTravelerInfoDto } from './dto/upsert-traveler-info.dto';

type TravelerInfoDoc = TravelerInfoInterface & Document;

@Injectable()
export class TravelerService extends BaseTenantRepository<TravelerInfoDoc> {
  constructor(
    @InjectModel('TravelerInfo') model: Model<TravelerInfoDoc>,
    tenantCtx: TenantContextService,
  ) {
    super(model, tenantCtx);
  }

  /** Obtiene la info del viajero del usuario en sesión para un evento específico. */
  async getMyInfo(eventId: string): Promise<TravelerInfoDoc | null> {
    return this.findOne({
      userId: this.tenantCtx.userId,
      eventId: new Types.ObjectId(eventId),
    } as any);
  }

  /** Crea o actualiza la info del viajero del usuario en sesión para un evento específico (upsert). */
  async upsertMyInfo(eventId: string, dto: UpsertTravelerInfoDto): Promise<TravelerInfoDoc> {
    const { organizationId: _ignored, userId: _alsoIgnored, eventId: _eventIdIgnored, ...safeDto } = dto as any;

    const existing = await this.getMyInfo(eventId);
    if (existing) {
      return this.update(existing._id.toString(), safeDto as any);
    }

    return this.create({
      ...safeDto,
      userId: this.tenantCtx.userId,
      eventId: new Types.ObjectId(eventId),
    } as any);
  }
}
