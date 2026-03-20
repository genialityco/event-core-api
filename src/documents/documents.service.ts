import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DocumentInterface } from './interfaces/document.interface';
import { Model, Types } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel('Document') private DocumentModel: Model<DocumentInterface>,
  ) {}

  async create(documentDto: CreateDocumentDto): Promise<DocumentInterface> {
    const newDocument = new this.DocumentModel(documentDto);
    return newDocument.save();
  }

  async update(id: string, documentDto: UpdateDocumentDto): Promise<DocumentInterface | null> {
    return this.DocumentModel.findByIdAndUpdate(id, documentDto, { new: true }).exec();
  }

  async findWithFilters(
    eventId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: DocumentInterface[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const filter: any = { eventId: new Types.ObjectId(eventId) };

    const knownKeys = new Set(['page', 'limit', 'current', 'pageSize', 'sorters', 'filters', '_start', '_end', '_sort', '_order']);
    Object.keys(paginationDto as any).forEach((key) => {
      if (knownKeys.has(key) || key === 'eventId') return;
      const value = (paginationDto as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        filter[key] = typeof value === 'string' ? { $regex: new RegExp(value, 'i') } : value;
      }
    });

    const totalItems = await this.DocumentModel.countDocuments(filter).exec();
    const items = await this.DocumentModel.find(filter).skip(skip).limit(limit).exec();
    const totalPages = Math.ceil(totalItems / limit);

    return { items, totalItems, totalPages, currentPage: page };
  }

  async findOne(id: string): Promise<DocumentInterface | null> {
    return this.DocumentModel.findById(id).exec();
  }

  async remove(id: string): Promise<DocumentInterface | null> {
    return this.DocumentModel.findByIdAndDelete(id).exec();
  }
}
