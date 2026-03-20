import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { TravelerFormConfigInterface } from './interfaces/traveler-form-config.interface';

type TravelerFormConfigDoc = TravelerFormConfigInterface & Document;

@Injectable()
export class TravelerFormConfigService {
  constructor(
    @InjectModel('TravelerFormConfig')
    private readonly model: Model<TravelerFormConfigDoc>,
  ) {}

  /** Obtiene la config del formulario para un evento. Si no existe, la crea con defaults. */
  async getOrCreate(eventId: string): Promise<TravelerFormConfigDoc> {
    const existing = await this.model.findOne({
      eventId: new Types.ObjectId(eventId),
    });
    if (existing) return existing;

    return this.model.create({ eventId: new Types.ObjectId(eventId) });
  }

  /** Actualiza (o crea) la config del formulario para un evento (upsert). */
  async upsert(
    eventId: string,
    dto: Partial<TravelerFormConfigInterface>,
  ): Promise<TravelerFormConfigDoc> {
    const { eventId: _ignored, ...safeDto } = dto as any;

    const doc = await this.model.findOneAndUpdate(
      { eventId: new Types.ObjectId(eventId) },
      { $set: safeDto },
      { new: true, upsert: true },
    );
    return doc;
  }

  /** Elimina la config (rara vez usado). */
  async remove(eventId: string): Promise<void> {
    const result = await this.model.findOneAndDelete({
      eventId: new Types.ObjectId(eventId),
    });
    if (!result) throw new NotFoundException('Configuración no encontrada');
  }
}
