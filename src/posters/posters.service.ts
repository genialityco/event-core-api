import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Poster } from './interfaces/poster.interface';
import { Model, Types } from 'mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreatePosterDto } from './dto/create-poster.dto';
import { UpdatePosterDto } from './dto/update-poster.dto';

@Injectable()
export class PostersService {
  constructor(@InjectModel('Poster') private PosterModel: Model<Poster>) {}

  async create(posterDto: CreatePosterDto): Promise<Poster> {
    const newPoster = new this.PosterModel(posterDto);
    return newPoster.save();
  }

  async update(id: string, posterDto: UpdatePosterDto): Promise<Poster | null> {
    return this.PosterModel.findByIdAndUpdate(id, posterDto, { new: true }).exec();
  }

  async findWithFilters(
    eventId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Poster[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = Number((paginationDto as any).current || (paginationDto as any).page || 1);
    const limit = Number((paginationDto as any).pageSize || (paginationDto as any).limit || 10);
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

    const totalItems = await this.PosterModel.countDocuments(filter).exec();
    const items = await this.PosterModel.find(filter).skip(skip).limit(limit).exec();
    const totalPages = Math.ceil(totalItems / limit);

    return { items, totalItems, totalPages, currentPage: page };
  }

  async findOne(id: string): Promise<Poster | null> {
    return this.PosterModel.findById(id).exec();
  }

  async remove(id: string): Promise<Poster | null> {
    return this.PosterModel.findByIdAndDelete(id).exec();
  }

  async voteForPoster(posterId: string, userId: string): Promise<Poster> {
    const poster = await this.PosterModel.findById(posterId).exec();
    if (!poster) throw new BadRequestException('Poster not found');

    if (poster.voters.includes(new Types.ObjectId(userId))) {
      throw new BadRequestException('You have already voted for this poster');
    }

    poster.votes += 1;
    poster.voters.push(new Types.ObjectId(userId));
    return poster.save();
  }
}
