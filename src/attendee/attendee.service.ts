import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attendee } from './interfaces/attendee.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';

@Injectable()
export class AttendeeService {
  constructor(
    @InjectModel('Attendee') private attendeeModel: Model<Attendee>,
  ) {}

  async create(attendeeData: CreateAttendeeDto): Promise<Attendee> {
    const newAttendee = new this.attendeeModel(attendeeData);
    return newAttendee.save();
  }

  async update(id: string, attendeeDto: UpdateAttendeeDto): Promise<Attendee | null> {
    return this.attendeeModel.findByIdAndUpdate(id, attendeeDto, { new: true }).exec();
  }

  async findByEvent(
    eventId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Attendee[];
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
      if (value === undefined || value === null || value === '') return;
      if (key === 'memberId' || key.endsWith('Id')) {
        filter[key] = new Types.ObjectId(value as string);
      } else {
        filter[key] = value;
      }
    });

    const totalItems = await this.attendeeModel.countDocuments(filter).exec();
    const items = await this.attendeeModel
      .find(filter)
      .populate('eventId')
      .populate('userId')
      .populate('memberId')
      .skip(skip)
      .limit(limit)
      .exec();
    const totalPages = Math.ceil(totalItems / limit);

    return { items, totalItems, totalPages, currentPage: page };
  }

  async findOne(id: string): Promise<Attendee | null> {
    return this.attendeeModel.findById(id).populate('eventId').populate('memberId').exec();
  }

  async remove(id: string): Promise<Attendee | null> {
    return this.attendeeModel.findByIdAndDelete(id).exec();
  }

  async incrementCertificateDownloads({ attendeeId }: { attendeeId?: string }): Promise<Attendee | null> {
    return this.attendeeModel
      .findOneAndUpdate(
        { _id: attendeeId },
        { $inc: { certificateDownloads: 1 } },
        { new: true },
      )
      .exec();
  }
}
