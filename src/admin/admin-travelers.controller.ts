import { Controller, Get, Delete, Param } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/events/:eventId/travelers')
export class AdminTravelersController {
  constructor(
    @InjectModel('TravelerInfo') private readonly travelerModel: Model<any>,
    @InjectModel('User') private readonly userModel: Model<any>,
  ) {}

  /** GET /admin/events/:eventId/travelers — lista todos los viajeros del evento con email del usuario */
  @Get()
  async findByEvent(@Param('eventId') eventId: string) {
    const travelers = await this.travelerModel
      .find({ eventId: new Types.ObjectId(eventId) })
      .sort({ createdAt: -1 })
      .lean();

    // Enriquecer con email del usuario
    const userIds = [...new Set(travelers.map((t) => t.userId).filter(Boolean))];
    const users = await this.userModel
      .find({ _id: { $in: userIds.map((id) => new Types.ObjectId(id)) } })
      .select('_id email')
      .lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u.email]));

    const items = travelers.map((t) => ({
      ...t,
      userEmail: userMap.get(t.userId) ?? null,
    }));

    return new ResponseDto('success', 'Viajeros encontrados', { items, total: items.length });
  }

  /** DELETE /admin/events/:eventId/travelers/:id — elimina el registro de un viajero */
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.travelerModel.findByIdAndDelete(id);
    return new ResponseDto('success', 'Registro eliminado', null);
  }
}
