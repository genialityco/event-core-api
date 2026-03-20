import {
  Controller,
  Post,
  Delete,
  Get,
  Patch,
  Param,
  Body,
} from '@nestjs/common';
import { SessionAttendanceService } from './session-attendance.service';
import { ResponseDto } from 'src/common/response.dto';

/**
 * Rutas: /events/:eventId/sessions/...
 *
 * POST   /events/:eventId/sessions/:sessionId/attend       → "asistiré"
 * DELETE /events/:eventId/sessions/:sessionId/attend       → cancelar
 * GET    /events/:eventId/sessions/:sessionId/attendees    → lista (staff)
 * GET    /events/:eventId/sessions/my-attendances          → mis sesiones
 * PATCH  /events/:eventId/sessions/:sessionId/check-in     → marcar asistió (staff)
 */
@Controller('events/:eventId/sessions')
export class SessionAttendanceController {
  constructor(private readonly service: SessionAttendanceService) {}

  @Get('my-attendances')
  async getMyAttendances(@Param('eventId') eventId: string) {
    const result = await this.service.getMyAttendances(eventId);
    return new ResponseDto('success', 'Sesiones registradas', result);
  }

  @Post(':sessionId/attend')
  async register(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.service.register(eventId, sessionId);
    return new ResponseDto('success', 'Registrado en la sesión', result);
  }

  @Delete(':sessionId/attend')
  async cancel(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
  ) {
    await this.service.cancel(eventId, sessionId);
    return new ResponseDto('success', 'Registro cancelado', null);
  }

  @Get(':sessionId/attendees')
  async getSessionAttendees(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
  ) {
    const result = await this.service.getSessionAttendees(eventId, sessionId);
    return new ResponseDto('success', 'Asistentes a la sesión', result);
  }

  @Patch(':sessionId/check-in')
  async checkIn(
    @Param('eventId') eventId: string,
    @Param('sessionId') sessionId: string,
    @Body('memberId') memberId: string,
  ) {
    const result = await this.service.checkIn(eventId, sessionId, memberId);
    return new ResponseDto('success', 'Check-in registrado', result);
  }
}
