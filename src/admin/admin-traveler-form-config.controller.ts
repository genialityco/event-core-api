import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/events/:eventId/travelers/form-config')
export class AdminTravelerFormConfigController {
  constructor(
    @InjectModel('TravelerFormConfig') private readonly formConfigModel: Model<any>,
  ) {}

  @Get()
  async getOrCreate(@Param('eventId') eventId: string) {
    let config = await this.formConfigModel.findOne({ eventId: new Types.ObjectId(eventId) }).lean();
    if (!config) {
      config = await this.formConfigModel.create({ eventId: new Types.ObjectId(eventId) });
    }
    return new ResponseDto('success', 'Configuración encontrada', config);
  }

  @Put()
  async upsert(@Param('eventId') eventId: string, @Body() body: any) {
    const config = await this.formConfigModel.findOneAndUpdate(
      { eventId: new Types.ObjectId(eventId) },
      { $set: body },
      { new: true, upsert: true },
    ).lean();
    return new ResponseDto('success', 'Configuración guardada', config);
  }
}
