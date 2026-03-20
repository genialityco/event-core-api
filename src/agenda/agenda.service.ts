import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Agenda } from './interfaces/agenda.interface';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateAgendaDto } from './dto/create-agenda.dto';
import { UpdateAgendaDto } from './dto/update-agenda.dto';

@Injectable()
export class AgendaService {
  constructor(@InjectModel('Agenda') private agendaModel: Model<Agenda>) {}

  async create(createAgendaDto: CreateAgendaDto): Promise<Agenda> {
    const newAgenda = new this.agendaModel(createAgendaDto);
    return newAgenda.save();
  }

  async update(id: string, updateAgendaDto: UpdateAgendaDto): Promise<Agenda | null> {
    return this.agendaModel
      .findByIdAndUpdate(id, updateAgendaDto, { new: true })
      .exec();
  }

  async findOne(id: string): Promise<Agenda | null> {
    return this.agendaModel
      .findById(id)
      .populate('eventId')
      .populate('sessions.speakers')
      .populate('sessions.moduleId')
      .populate('sessions.subSessions.speakers')
      .populate('sessions.subSessions.moduleId')
      .exec();
  }

  async findWithFilters(
    eventId: string,
    paginationDto: PaginationDto,
  ): Promise<{
    items: Agenda[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  }> {
    const page = Number((paginationDto as any).current || (paginationDto as any).page || 1);
    const limit = Number((paginationDto as any).pageSize || (paginationDto as any).limit || 10);
    const skip = (page - 1) * limit;

    const mongoFilter: any = {
      eventId: new Types.ObjectId(eventId),
    };

    const knownKeys = new Set([
      '_start', '_end', '_sort', '_order',
      'page', 'limit', 'current', 'pageSize', 'sorters', 'filters',
    ]);

    Object.keys(paginationDto as any).forEach((key) => {
      if (knownKeys.has(key)) return;
      if (key === 'eventId') return; // viene del param, no del query
      const value = (paginationDto as any)[key];
      if (value === undefined || value === null || value === '') return;
      mongoFilter[key] = value;
    });

    const filters = (((paginationDto as any).filters || []) as any[]) || [];
    for (const f of filters) {
      const field = f?.field;
      if (!field || field === 'eventId') continue;
      const operator = String(f?.operator || 'eq');
      const value = f?.value;
      if (value === undefined || value === null || value === '') continue;
      if (operator === 'eq') {
        mongoFilter[field] = value;
      } else if (operator === 'contains') {
        mongoFilter[field] = { $regex: String(value), $options: 'i' };
      }
    }

    const sortOptions: any = {};
    const sorters = (paginationDto as any).sorters;
    if (Array.isArray(sorters) && sorters.length > 0) {
      for (const s of sorters) {
        if (!s?.field) continue;
        sortOptions[s.field] = String(s.order || 'asc').toLowerCase() === 'desc' ? -1 : 1;
      }
    } else {
      sortOptions.createdAt = -1;
    }

    const totalItems = await this.agendaModel.countDocuments(mongoFilter).exec();
    const items = await this.agendaModel
      .find(mongoFilter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('eventId')
      .populate('sessions.speakers')
      .populate('sessions.moduleId')
      .populate('sessions.subSessions.speakers')
      .populate('sessions.subSessions.moduleId')
      .exec();

    const totalPages = Math.ceil(totalItems / limit);
    return { items, totalItems, totalPages, currentPage: page };
  }

  async remove(id: string): Promise<Agenda | null> {
    return this.agendaModel.findByIdAndDelete(id).exec();
  }

  async adjustTimes(id: string, minutes: number): Promise<Agenda | null> {
    const agenda = await this.agendaModel.findById(id);
    if (!agenda) return null;

    agenda.sessions.forEach((session: any) => {
      session.startDateTime = new Date(session.startDateTime.getTime() + minutes * 60000);
      session.endDateTime = new Date(session.endDateTime.getTime() + minutes * 60000);
    });

    return agenda.save();
  }
}
