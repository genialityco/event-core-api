import { FilterQuery, Model, Types } from 'mongoose';
import { PaginationDto } from '../../common/dto/pagination.dto';

/**
 * Versión segura de findWithFilters.
 *
 * DIFERENCIAS CRÍTICAS respecto a common.service.ts::findWithFilters:
 * 1. Recibe `tenantFilter` como parámetro OBLIGATORIO — no puede omitirse.
 * 2. El tenantFilter tiene PRECEDENCIA sobre cualquier filtro del cliente.
 * 3. Cualquier intento del cliente de pasar `organizationId` en query params es IGNORADO.
 * 4. El organizationId siempre viene del TenantContextService (AsyncLocalStorage).
 */
export async function findWithFiltersSecure<T>(
  model: Model<T>,
  paginationDto: PaginationDto,
  tenantFilter: { organizationId: string },
  populateFields: string[] = [],
): Promise<{
  items: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}> {
  const page = Number(paginationDto.current || paginationDto.page || 1);
  const limit = Number(paginationDto.pageSize || paginationDto.limit || 10);
  const skip = (page - 1) * limit;

  // El filterQuery SIEMPRE empieza con el tenant filter
  const filterQuery: FilterQuery<T> = {
    organizationId: tenantFilter.organizationId,
  } as FilterQuery<T>;

  const knownKeys = [
    '_start', '_end', '_sort', '_order',
    'page', 'limit', 'current', 'pageSize',
    'sorters', 'filters',
  ];

  const dtoAny = paginationDto as any;

  // Procesar propiedades directas del DTO (sin organizationId)
  Object.keys(dtoAny).forEach((key) => {
    if (knownKeys.includes(key)) return;
    if (dtoAny[key] === undefined || dtoAny[key] === null) return;
    if (key === 'organizationId') return; // BLOQUEADO — siempre del context

    appendToFilter(filterQuery, key, 'eq', dtoAny[key]);
  });

  // Procesar array de filtros (sin organizationId)
  // Normalizar: puede llegar como array o como objeto indexado {"0": {...}, "1": {...}}
  // cuando class-transformer no transforma (ej. sin ValidationPipe global)
  const filtersRaw = dtoAny.filters;
  const filters: any[] = Array.isArray(filtersRaw)
    ? filtersRaw
    : filtersRaw && typeof filtersRaw === 'object'
      ? Object.keys(filtersRaw)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map((k) => filtersRaw[k])
      : [];
  filters.forEach((filter: any) => {
    const { field, operator = 'eq', value } = filter;
    if (!value && value !== 0 && value !== false) return;
    if (field === 'organizationId') return; // BLOQUEADO

    appendToFilter(filterQuery, field, operator, value);
  });

  // Ordenamiento
  const sortOptions: Record<string, 1 | -1> = {};
  if (Array.isArray(dtoAny.sorters) && dtoAny.sorters.length > 0) {
    dtoAny.sorters.forEach((s: any) => {
      if (s.field) {
        sortOptions[s.field] = s.order?.toLowerCase() === 'desc' ? -1 : 1;
      }
    });
  } else if (dtoAny._sort && dtoAny._order) {
    sortOptions[dtoAny._sort] = dtoAny._order.toLowerCase() === 'desc' ? -1 : 1;
  }

  const finalSort =
    Object.keys(sortOptions).length > 0
      ? { ...sortOptions, _id: 1 as 1 }
      : { createdAt: -1 as -1, _id: 1 as 1 };

  const [totalItems, items] = await Promise.all([
    model.countDocuments(filterQuery).exec(),
    model
      .find(filterQuery)
      .sort(finalSort)
      .skip(skip)
      .limit(limit)
      .exec(),
  ]);

  return {
    items: items as T[],
    totalItems,
    totalPages: Math.ceil(totalItems / limit),
    currentPage: page,
  };
}

/**
 * Convierte un valor de filtro al tipo correcto para comparaciones ($gt, $gte, $lt, $lte).
 * Prioridad: número → fecha ISO → string original.
 */
function parseComparableValue(value: any): any {
  const num = Number(value);
  if (!isNaN(num)) return num;

  if (typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) return date;
  }

  return value;
}

function appendToFilter(
  query: Record<string, any>,
  field: string,
  operator: string,
  value: any,
): void {
  const str = String(value);

  switch (operator) {
    case 'eq':
      if (field === '_id') {
        if (/^[0-9a-fA-F]{24}$/.test(str)) {
          try { query[field] = new Types.ObjectId(str); } catch { /* skip */ }
        }
      } else if (field.endsWith('Id') || field.endsWith('id')) {
        try { query[field] = new Types.ObjectId(str); } catch { query[field] = str; }
      } else if (field === 'attended' && typeof value === 'string') {
        query[field] = str.toLowerCase() === 'true';
      } else {
        query[field] = value;
      }
      break;
    case 'contains':
      query[field] = { $regex: new RegExp(str, 'i') };
      break;
    case 'startswith':
      query[field] = { $regex: new RegExp(`^${str}`, 'i') };
      break;
    case 'endswith':
      query[field] = { $regex: new RegExp(`${str}$`, 'i') };
      break;
    case 'gt':
      query[field] = { $gt: parseComparableValue(value) };
      break;
    case 'gte':
      query[field] = { $gte: parseComparableValue(value) };
      break;
    case 'lt':
      query[field] = { $lt: parseComparableValue(value) };
      break;
    case 'lte':
      query[field] = { $lte: parseComparableValue(value) };
      break;
    case 'ne':
      query[field] = { $ne: value };
      break;
    case 'in':
      query[field] = { $in: Array.isArray(value) ? value : [value] };
      break;
    case 'nin':
      query[field] = { $nin: Array.isArray(value) ? value : [value] };
      break;
    default:
      query[field] = value;
  }
}
