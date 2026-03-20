import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { TravelerService } from './traveler.service';
import { UpsertTravelerInfoDto } from './dto/upsert-traveler-info.dto';

/**
 * Rutas protegidas por TenantMiddleware (global).
 * No requieren guard adicional — el middleware ya verificó el token y seteó el contexto.
 */
@Controller('events/:eventId/travelers')
export class TravelerController {
  constructor(private readonly travelerService: TravelerService) {}

  /** GET /events/:eventId/travelers/me — info del viajero del usuario en sesión para este evento */
  @Get('me')
  async getMyInfo(@Param('eventId') eventId: string) {
    return this.travelerService.getMyInfo(eventId);
  }

  /** PUT /events/:eventId/travelers/me — crea o actualiza la info del viajero (upsert) */
  @Put('me')
  async upsertMyInfo(
    @Param('eventId') eventId: string,
    @Body() dto: UpsertTravelerInfoDto,
  ) {
    return this.travelerService.upsertMyInfo(eventId, dto);
  }
}
