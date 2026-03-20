import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Body, Query,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/speakers')
export class AdminSpeakersController {
  constructor(
    @InjectModel('Speaker') private readonly speakerModel: Model<any>,
  ) {}

  @Get()
  async findByEvent(@Query('eventId') eventId: string) {
    const items = await this.speakerModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ names: 1 })
      .lean();
    return new ResponseDto('success', 'Conferencistas encontrados', { items, total: items.length });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const speaker = await this.speakerModel.findById(id).lean();
    return new ResponseDto('success', 'Conferencista encontrado', speaker);
  }

  @Post()
  async create(@Body() body: any) {
    const speaker = await this.speakerModel.create(body);
    return new ResponseDto('success', 'Conferencista creado', speaker);
  }

  @Put(':id')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const speaker = await this.speakerModel.findByIdAndUpdate(id, body, { new: true }).lean();
    return new ResponseDto('success', 'Conferencista actualizado', speaker);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.speakerModel.findByIdAndDelete(id);
    return new ResponseDto('success', 'Conferencista eliminado', null);
  }
}
