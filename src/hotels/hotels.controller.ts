import { Controller, Get, Post, Put, Patch, Delete, Param, Body, ValidationPipe } from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { UpdateHotelDto } from './dto/update-hotel.dto';
import { ResponseDto } from 'src/common/response.dto';

@Controller('events/:eventId/hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    const hotels = await this.hotelsService.findByEvent(eventId);
    return new ResponseDto('success', 'Hoteles encontrados', hotels);
  }

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body(new ValidationPipe()) dto: CreateHotelDto,
  ) {
    const hotel = await this.hotelsService.createHotel({ ...dto, eventId } as any);
    return new ResponseDto('success', 'Hotel creado', hotel);
  }

  @Put(':id')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) dto: UpdateHotelDto,
  ) {
    const hotel = await this.hotelsService.updateHotel(id, dto);
    return new ResponseDto('success', 'Hotel actualizado', hotel);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.hotelsService.removeHotel(id);
    return new ResponseDto('success', 'Hotel eliminado', null);
  }
}
