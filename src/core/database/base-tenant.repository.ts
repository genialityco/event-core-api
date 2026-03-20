import { Document, FilterQuery, Model, UpdateQuery } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { TenantContextService } from '../tenant/tenant-context.service';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { findWithFiltersSecure } from './find-with-filters-secure.util';

/**
 * Repositorio base multi-tenant.
 *
 * GARANTÍAS:
 * - Ninguna query puede ejecutarse sin organizationId del contexto activo.
 * - organizationId NUNCA proviene del request body o query params.
 * - Cualquier intento externo de pasar organizationId es ignorado o descartado.
 * - findAll, findOne, findById, create, update, delete → siempre filtrados por tenant.
 */
export abstract class BaseTenantRepository<T extends Document> {
  constructor(
    protected readonly model: Model<T>,
    protected readonly tenantCtx: TenantContextService,
  ) {}

  /**
   * Filter que SIEMPRE incluye organizationId del AsyncLocalStorage.
   * Acceso solo a través de este getter — no puede ser sobreescrito externamente.
   */
  protected get tenantFilter(): { organizationId: string } {
    return { organizationId: this.tenantCtx.organizationId };
  }

  /**
   * Merge seguro: tenantFilter tiene precedencia absoluta.
   * Elimina cualquier organizationId que venga en el filtro externo.
   */
  private secureFilter(external: FilterQuery<T> = {}): FilterQuery<T> {
    const { organizationId: _ignored, ...safe } = external as any;
    return { ...safe, ...this.tenantFilter } as FilterQuery<T>;
  }

  async findAll(filter: FilterQuery<T> = {}): Promise<T[]> {
    return this.model.find(this.secureFilter(filter)).exec();
  }

  async findWithPagination(paginationDto: PaginationDto): Promise<{
    items: T[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    return findWithFiltersSecure<T>(this.model, paginationDto, this.tenantFilter);
  }

  async findOne(filter: FilterQuery<T>): Promise<T | null> {
    return this.model.findOne(this.secureFilter(filter)).exec();
  }

  async findById(id: string): Promise<T | null> {
    return this.model
      .findOne({ _id: id, ...this.tenantFilter })
      .exec();
  }

  async findByIdOrThrow(id: string): Promise<T> {
    const doc = await this.findById(id);
    if (!doc) {
      throw new NotFoundException(
        `Recurso con id ${id} no encontrado en esta organización`,
      );
    }
    return doc;
  }

  async create(data: Partial<T>): Promise<T> {
    // Eliminar cualquier organizationId que venga del exterior
    const { organizationId: _ignored, ...safeData } = data as any;
    const doc = new this.model({ ...safeData, ...this.tenantFilter });
    return doc.save() as Promise<T>;
  }

  async update(id: string, data: UpdateQuery<T>): Promise<T | null> {
    const { organizationId: _ignored, ...safeData } = data as any;
    return this.model
      .findOneAndUpdate(
        { _id: id, ...this.tenantFilter },
        safeData,
        { new: true },
      )
      .exec();
  }

  async delete(id: string): Promise<T | null> {
    return this.model
      .findOneAndDelete({ _id: id, ...this.tenantFilter })
      .exec();
  }

  async count(filter: FilterQuery<T> = {}): Promise<number> {
    return this.model.countDocuments(this.secureFilter(filter)).exec();
  }
}
