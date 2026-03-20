import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/useful-info')
export class AdminUsefulInfoController {
  constructor(@InjectModel('UsefulInfo') private readonly model: Model<any>) {}

  @Get()
  async findByEvent(@Query('eventId') eventId: string) {
    const items = await this.model
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ order: 1, createdAt: -1 })
      .lean();
    return new ResponseDto('success', 'Info encontrada', { items, total: items.length });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.model.findById(id).lean();
    return new ResponseDto('success', 'Item encontrado', item);
  }

  @Post()
  async create(@Body() body: any) {
    const item = await this.model.create(body);
    return new ResponseDto('success', 'Item creado', item);
  }

  @Put(':id')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const item = await this.model.findByIdAndUpdate(id, body, { new: true }).lean();
    return new ResponseDto('success', 'Item actualizado', item);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.model.findByIdAndDelete(id);
    return new ResponseDto('success', 'Item eliminado', null);
  }
}
