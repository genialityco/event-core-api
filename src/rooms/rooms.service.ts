import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Room } from './interfaces/room.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class RoomsService {
  constructor(@InjectModel('Room') private RoomModel: Model<Room>) {}

  async create(createRoomDto: any): Promise<Room> {
    const newRoom = new this.RoomModel(createRoomDto);
    return newRoom.save();
  }

  async update(id: string, updateRoomDto: any): Promise<Room> {
    const room = await this.RoomModel.findByIdAndUpdate(id, updateRoomDto, { new: true }).exec();
    if (!room) throw new NotFoundException('Sala no encontrada');
    return room;
  }

  async findWithFilters(
    eventId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Room[];
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
        filter[key] = typeof value === 'string' ? { $regex: value, $options: 'i' } : value;
      }
    });

    const totalItems = await this.RoomModel.countDocuments(filter).exec();
    const items = await this.RoomModel.find(filter).skip(skip).limit(limit).exec();
    const totalPages = Math.ceil(totalItems / limit);

    return { items, totalItems, totalPages, currentPage: page };
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.RoomModel.findById(id).exec();
    if (!room) throw new NotFoundException('Sala no encontrada');
    return room;
  }

  async remove(id: string): Promise<Room> {
    const room = await this.RoomModel.findByIdAndDelete(id).exec();
    if (!room) throw new NotFoundException('Sala no encontrada');
    return room;
  }
}
