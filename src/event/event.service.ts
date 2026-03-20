import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EventInterface } from './interfaces/event.interface';
import { Document, Model } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { BaseTenantRepository } from '../core/database/base-tenant.repository';
import { TenantContextService } from '../core/tenant/tenant-context.service';

type EventDoc = EventInterface & Document;

/**
 * EventService — MÓDULO PILOTO de migración a multi-tenant.
 *
 * Extiende BaseTenantRepository: TODAS las queries están automáticamente
 * filtradas por organizationId del TenantContextService (AsyncLocalStorage).
 *
 * ELIMINADO:
 * - find() sin filtro de org → imposible con BaseTenantRepository
 * - findWithFilters() inseguro → reemplazado por findWithPagination()
 * - organizationId del body/query → viene SOLO del TenantContext
 */
@Injectable()
export class EventService extends BaseTenantRepository<EventDoc> {
  constructor(
    @InjectModel('Event') eventModel: Model<EventDoc>,
    tenantCtx: TenantContextService,
  ) {
    super(eventModel, tenantCtx);
  }

  /**
   * Crear evento — organizationId del DTO es IGNORADO.
   * Siempre se inyecta desde TenantContextService.
   */
  async createEvent(dto: CreateEventDto): Promise<EventDoc> {
    return super.create(dto as any);
  }

  async updateEvent(id: string, dto: UpdateEventDto): Promise<EventDoc | null> {
    return super.update(id, dto as any);
  }

  /**
   * findWithFilters → alias seguro de findWithPagination.
   * Nombre original preservado para no romper EventController.
   */
  async findWithFilters(paginationDto: PaginationDto) {
    return this.findWithPagination(paginationDto);
  }

  async findOneById(id: string): Promise<EventDoc | null> {
    return super.findById(id);
  }

  async removeById(id: string): Promise<EventDoc | null> {
    return super.delete(id);
  }

  /** Eventos próximos de la organización activa */
  async findUpcoming() {
    return this.findAll({ startDate: { $gte: new Date() } } as any);
  }
}
