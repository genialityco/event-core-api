import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import { TravelerFormConfigService } from './traveler-form-config.service';
import { ResponseDto } from 'src/common/response.dto';

/**
 * Rutas bajo /events/:eventId/travelers/form-config
 *
 * GET  /events/:eventId/travelers/form-config      → leer config (app + CMS)
 * PUT  /events/:eventId/travelers/form-config      → guardar config (CMS)
 * DELETE /events/:eventId/travelers/form-config    → resetear a defaults (CMS)
 */
@Controller('events/:eventId/travelers/form-config')
export class TravelerFormConfigController {
  constructor(private readonly service: TravelerFormConfigService) {}

  @Get()
  async getConfig(@Param('eventId') eventId: string) {
    const result = await this.service.getOrCreate(eventId);
    return new ResponseDto('success', 'Configuración del formulario', result);
  }

  @Put()
  async upsertConfig(
    @Param('eventId') eventId: string,
    @Body() body: any,
  ) {
    const result = await this.service.upsert(eventId, body);
    return new ResponseDto('success', 'Configuración guardada', result);
  }

  @Delete()
  async resetConfig(@Param('eventId') eventId: string) {
    await this.service.remove(eventId);
    return new ResponseDto('success', 'Configuración eliminada (se usarán defaults)', null);
  }
}
