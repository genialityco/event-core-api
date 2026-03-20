import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
import { TenantContextService } from '../core/tenant/tenant-context.service';
import { SessionAttendance } from './interfaces/session-attendance.interface';

type SessionAttendanceDoc = SessionAttendance & Document;

@Injectable()
export class SessionAttendanceService {
  constructor(
    @InjectModel('SessionAttendance')
    private readonly model: Model<SessionAttendanceDoc>,
    @InjectModel('Agenda')
    private readonly agendaModel: Model<any>,
    private readonly tenantCtx: TenantContextService,
  ) {}

  /** Resuelve el agenda y valida que la sesión exista y tenga requiresAttendance=true */
  private async resolveAgenda(
    eventId: string,
    sessionId: string,
    checkAttendance = false,
  ): Promise<{ agendaId: Types.ObjectId }> {
    const agenda = await this.agendaModel.findOne({
      eventId: new Types.ObjectId(eventId),
      'sessions._id': new Types.ObjectId(sessionId),
    });
    if (!agenda) {
      throw new NotFoundException('Sesión no encontrada en este evento');
    }
    if (checkAttendance) {
      const session = agenda.sessions.find(
        (s: any) => s._id.toString() === sessionId,
      );
      if (!session?.requiresAttendance) {
        throw new BadRequestException(
          'Esta sesión no tiene marcación de asistencia habilitada',
        );
      }
    }
    return { agendaId: agenda._id };
  }

  /** Usuario marca "asistiré" a una sesión */
  async register(
    eventId: string,
    sessionId: string,
  ): Promise<SessionAttendanceDoc> {
    const { userId, memberId } = this.tenantCtx;
    if (!memberId) {
      throw new NotFoundException('No se encontró el perfil de miembro');
    }

    const existing = await this.model.findOne({
      sessionId: new Types.ObjectId(sessionId),
      memberId: new Types.ObjectId(memberId),
    });
    if (existing) {
      throw new ConflictException('Ya estás registrado en esta sesión');
    }

    const { agendaId } = await this.resolveAgenda(eventId, sessionId, true);

    return this.model.create({
      eventId: new Types.ObjectId(eventId),
      agendaId,
      sessionId: new Types.ObjectId(sessionId),
      memberId: new Types.ObjectId(memberId),
      userId,
      status: 'registered',
    });
  }

  /** Usuario cancela su registro a una sesión */
  async cancel(eventId: string, sessionId: string): Promise<void> {
    // Valida que la sesión existe (sin necesidad de checkAttendance en cancel)
    await this.resolveAgenda(eventId, sessionId, false);
    const { memberId } = this.tenantCtx;
    const result = await this.model.findOneAndDelete({
      eventId: new Types.ObjectId(eventId),
      sessionId: new Types.ObjectId(sessionId),
      memberId: new Types.ObjectId(memberId),
    });
    if (!result) {
      throw new NotFoundException('Registro no encontrado');
    }
  }

  /** Lista todos los registrados a una sesión — valida que exista (sin checkAttendance) */
  async getSessionAttendees(
    eventId: string,
    sessionId: string,
  ): Promise<SessionAttendanceDoc[]> {
    return this.model
      .find({
        eventId: new Types.ObjectId(eventId),
        sessionId: new Types.ObjectId(sessionId),
      })
      .populate('memberId')
      .exec();
  }

  /** Lista las sesiones a las que el usuario actual se ha registrado en el evento */
  async getMyAttendances(eventId: string): Promise<SessionAttendanceDoc[]> {
    const { userId } = this.tenantCtx;
    return this.model
      .find({
        eventId: new Types.ObjectId(eventId),
        userId,
      })
      .exec();
  }

  /** Staff marca a un miembro como "asistió" en una sesión */
  async checkIn(
    eventId: string,
    sessionId: string,
    memberId: string,
  ): Promise<SessionAttendanceDoc> {
    const record = await this.model.findOneAndUpdate(
      {
        eventId: new Types.ObjectId(eventId),
        sessionId: new Types.ObjectId(sessionId),
        memberId: new Types.ObjectId(memberId),
      },
      { status: 'attended' },
      { new: true },
    );
    if (!record) {
      throw new NotFoundException(
        'El miembro no está registrado en esta sesión',
      );
    }
    return record;
  }
}
