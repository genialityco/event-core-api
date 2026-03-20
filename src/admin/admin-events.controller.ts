import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query, ValidationPipe,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateEventDto } from 'src/event/dto/create-event.dto';
import { UpdateEventDto } from 'src/event/dto/update-event.dto';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/events')
export class AdminEventsController {
  constructor(
    @InjectModel('Event') private readonly eventModel: Model<any>,
  ) {}

  @Get()
  async findByOrg(@Query('organizationId') organizationId: string) {
    const items = await this.eventModel
      .find({ organizationId: new Types.ObjectId(organizationId) })
      .sort({ startDate: 1 })
      .lean();
    return new ResponseDto('success', 'Eventos encontrados', { items, total: items.length });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventModel.findById(id).lean();
    return new ResponseDto('success', 'Evento encontrado', event);
  }

  @Post()
  async create(@Body(new ValidationPipe()) dto: CreateEventDto) {
    const event = await this.eventModel.create(dto);
    return new ResponseDto('success', 'Evento creado', event);
  }

  @Put(':id')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false })) dto: UpdateEventDto,
  ) {
    const event = await this.eventModel.findByIdAndUpdate(id, dto, { new: true }).lean();
    return new ResponseDto('success', 'Evento actualizado', event);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.eventModel.findByIdAndDelete(id);
    return new ResponseDto('success', 'Evento eliminado', null);
  }
}
