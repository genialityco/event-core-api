import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/agendas')
export class AdminAgendaController {
  constructor(
    @InjectModel('Agenda') private readonly agendaModel: Model<any>,
  ) {}

  @Get()
  async findByEvent(@Query('eventId') eventId: string) {
    const items = await this.agendaModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ createdAt: 1 })
      .lean();
    return new ResponseDto('success', 'Agendas encontradas', { items, total: items.length });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const agenda = await this.agendaModel.findById(id).lean();
    return new ResponseDto('success', 'Agenda encontrada', agenda);
  }

  @Post()
  async create(@Body() body: any) {
    const agenda = await this.agendaModel.create(body);
    return new ResponseDto('success', 'Agenda creada', agenda);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const agenda = await this.agendaModel
      .findByIdAndUpdate(id, body, { new: true })
      .lean();
    return new ResponseDto('success', 'Agenda actualizada', agenda);
  }

  @Patch(':id/publish')
  async publish(@Param('id') id: string) {
    const agenda = await this.agendaModel
      .findByIdAndUpdate(
        id,
        { isPublished: true, publishedAt: new Date() },
        { new: true },
      )
      .lean();
    return new ResponseDto('success', 'Agenda publicada', agenda);
  }

  @Patch(':id/unpublish')
  async unpublish(@Param('id') id: string) {
    const agenda = await this.agendaModel
      .findByIdAndUpdate(
        id,
        { isPublished: false },
        { new: true },
      )
      .lean();
    return new ResponseDto('success', 'Agenda despublicada', agenda);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.agendaModel.findByIdAndDelete(id);
    return new ResponseDto('success', 'Agenda eliminada', null);
  }
}
