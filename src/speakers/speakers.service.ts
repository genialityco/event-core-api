import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Speaker } from './interfaces/speakers.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class SpeakersService {
  constructor(@InjectModel('Speaker') private SpeakerModel: Model<Speaker>) {}

  async create(createSpeakerDto: any): Promise<Speaker> {
    const newSpeaker = new this.SpeakerModel(createSpeakerDto);
    return newSpeaker.save();
  }

  async findWithFilters(
    eventId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Speaker[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = Number((paginationDto as any).current || (paginationDto as any).page || 1);
    const limit = Number((paginationDto as any).pageSize || (paginationDto as any).limit || 200);
    const skip = (page - 1) * limit;

    const filter: any = { eventId: new Types.ObjectId(eventId) };

    const knownKeys = new Set(['page', 'limit', 'current', 'pageSize', 'sorters', 'filters', '_start', '_end', '_sort', '_order']);
    Object.keys(paginationDto as any).forEach((key) => {
      if (knownKeys.has(key) || key === 'eventId') return;
      const value = (paginationDto as any)[key];
      if (value !== undefined && value !== null && value !== '') {
        filter[key] = { $regex: String(value), $options: 'i' };
      }
    });

    const totalItems = await this.SpeakerModel.countDocuments(filter).exec();
    const items = await this.SpeakerModel.find(filter).skip(skip).limit(limit).exec();
    const totalPages = Math.ceil(totalItems / limit);

    return { items, totalItems, totalPages, currentPage: page };
  }

  async findOne(id: string): Promise<Speaker> {
    const speaker = await this.SpeakerModel.findById(id).exec();
    if (!speaker) throw new NotFoundException('Speaker no encontrado');
    return speaker;
  }

  async update(id: string, updateSpeakerDto: any): Promise<Speaker> {
    const speaker = await this.SpeakerModel.findByIdAndUpdate(id, updateSpeakerDto, { new: true }).exec();
    if (!speaker) throw new NotFoundException('Speaker no encontrado');
    return speaker;
  }

  async remove(id: string): Promise<Speaker> {
    const speaker = await this.SpeakerModel.findByIdAndDelete(id).exec();
    if (!speaker) throw new NotFoundException('Speaker no encontrado');
    return speaker;
  }
}
