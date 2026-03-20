import { Controller, Get, Delete, Param, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/photos')
export class AdminPhotosController {
  constructor(@InjectModel('Photo') private readonly photoModel: Model<any>) {}

  @Get()
  async findByEvent(@Query('eventId') eventId: string) {
    const items = await this.photoModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ createdAt: -1 })
      .lean();
    return new ResponseDto('success', 'Fotos encontradas', { items, total: items.length });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.photoModel.findByIdAndDelete(id);
    return new ResponseDto('success', 'Foto eliminada', null);
  }
}
