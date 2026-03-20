import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/hotels')
export class AdminHotelsController {
  constructor(@InjectModel('Hotel') private readonly hotelModel: Model<any>) {}

  @Get()
  async findByEvent(@Query('eventId') eventId: string) {
    const items = await this.hotelModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ isMain: -1, order: 1 })
      .lean();
    return new ResponseDto('success', 'Hoteles encontrados', { items, total: items.length });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const hotel = await this.hotelModel.findById(id).lean();
    return new ResponseDto('success', 'Hotel encontrado', hotel);
  }

  @Post()
  async create(@Body() body: any) {
    const hotel = await this.hotelModel.create(body);
    return new ResponseDto('success', 'Hotel creado', hotel);
  }

  @Put(':id')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    const hotel = await this.hotelModel.findByIdAndUpdate(id, body, { new: true }).lean();
    return new ResponseDto('success', 'Hotel actualizado', hotel);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.hotelModel.findByIdAndDelete(id);
    return new ResponseDto('success', 'Hotel eliminado', null);
  }
}
