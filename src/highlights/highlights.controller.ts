import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import { HighlightsService } from './highlights.service';
import { CreateHighlightDto } from './dto/create-highlight.dto';
import { UpdateHighlightDto } from './dto/update-highlight.dto';
import { Highlight } from './interfaces/highlight.interface';
import { ResponseDto } from 'src/common/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('events/:eventId/highlights')
export class HighlightsController {
  constructor(private readonly highlightsService: HighlightsService) {}

  @Get('search')
  async findWithFilters(
    @Param('eventId') eventId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<ResponseDto<any>> {
    const result = await this.highlightsService.findWithFilters(eventId, paginationDto);
    return result.items.length > 0
      ? new ResponseDto('success', 'Highlights encontrados', result)
      : new ResponseDto('error', 'No se encontraron highlights');
  }

  @Get()
  async findAll(
    @Param('eventId') eventId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.highlightsService.findWithFilters(eventId, paginationDto);
    return {
      data: {
        items: result.items,
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
      },
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ResponseDto<Highlight>> {
    const result = await this.highlightsService.findOne(id);
    return result
      ? new ResponseDto('success', 'Highlight encontrado', result)
      : new ResponseDto('error', 'No se encontró el highlight');
  }

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body(new ValidationPipe()) createHighlightDto: CreateHighlightDto,
  ): Promise<ResponseDto<Highlight>> {
    const result = await this.highlightsService.create({ ...createHighlightDto, eventId });
    return result
      ? new ResponseDto('success', 'Highlight creado', result)
      : new ResponseDto('error', 'No se pudo crear el highlight');
  }

  @Patch(':id')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updateHighlightDto: UpdateHighlightDto,
  ): Promise<ResponseDto<Highlight>> {
    const result = await this.highlightsService.update(id, updateHighlightDto);
    return result
      ? new ResponseDto('success', 'Highlight actualizado', result)
      : new ResponseDto('error', 'No se pudo actualizar el highlight');
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseDto<Highlight>> {
    const result = await this.highlightsService.remove(id);
    return result
      ? new ResponseDto('success', 'Highlight eliminado', result)
      : new ResponseDto('error', 'No se pudo eliminar el highlight');
  }
}
