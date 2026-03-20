import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ValidationPipe,
  ForbiddenException,
} from '@nestjs/common';
import { PhotosService } from './photos.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { TenantContextService } from '../core/tenant/tenant-context.service';
import { ResponseDto } from 'src/common/response.dto';

@Controller('events/:eventId/photos')
export class PhotosController {
  constructor(
    private readonly photosService: PhotosService,
    private readonly tenantCtx: TenantContextService,
  ) {}

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    const photos = await this.photosService.findByEvent(eventId);
    return new ResponseDto('success', 'Fotos encontradas', photos);
  }

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body(new ValidationPipe()) dto: CreatePhotoDto,
  ) {
    const userId = this.tenantCtx.userId;
    const photo = await this.photosService.createPhoto(eventId, dto, userId);
    return new ResponseDto('success', 'Foto guardada', photo);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const photo = await this.photosService.findById(id);
    const userId = this.tenantCtx.userId;
    if (photo && photo.userId !== userId) {
      throw new ForbiddenException('No puedes eliminar esta foto');
    }
    await this.photosService.removePhoto(id);
    return new ResponseDto('success', 'Foto eliminada', null);
  }
}
