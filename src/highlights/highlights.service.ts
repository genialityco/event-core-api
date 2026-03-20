import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Highlight } from './interfaces/highlight.interface';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class HighlightsService {
  constructor(
    @InjectModel('Highlight') private highlightModel: Model<Highlight>,
  ) {}

  async create(createHighlightDto: CreateHighlightDto): Promise<Highlight> {
    const newHighlight = new this.highlightModel(createHighlightDto);
    return newHighlight.save();
  }

  async update(id: string, updateHighlightDto: UpdateHighlightDto): Promise<Highlight | null> {
    return this.highlightModel
      .findByIdAndUpdate(id, updateHighlightDto, { new: true })
      .exec();
  }

  async findWithFilters(
    eventId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Highlight[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = Number((paginationDto as any).current || (paginationDto as any).page || 1);
    const limit = Number((paginationDto as any).pageSize || (paginationDto as any).limit || 50);
    const skip = (page - 1) * limit;

    const filter: any = { eventId: new Types.ObjectId(eventId) };

    const knownKeys = new Set(['page', 'limit', 'current', 'pageSize', 'sorters', 'filters', '_start', '_end', '_sort', '_order']);
    Object.keys(paginationDto as any).forEach((key) => {
      if (knownKeys.has(key) || key === 'eventId') return;
      const value = (paginationDto as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        filter[key] = typeof value === 'string' ? { $regex: String(value), $options: 'i' } : value;
      }
    });

    const totalItems = await this.highlightModel.countDocuments(filter).exec();
    const items = await this.highlightModel.find(filter).skip(skip).limit(limit).exec();
    const totalPages = Math.ceil(totalItems / limit);

    return { items, totalItems, totalPages, currentPage: page };
  }

  async findOne(id: string): Promise<Highlight | null> {
    return this.highlightModel.findById(id).populate('eventId').exec();
  }

  async remove(id: string): Promise<Highlight | null> {
    return this.highlightModel.findByIdAndDelete(id).exec();
  }
}
