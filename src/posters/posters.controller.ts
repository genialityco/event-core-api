import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { PostersService } from './posters.service';
import { CreatePosterDto } from './dto/create-poster.dto';
import { UpdatePosterDto } from './dto/update-poster.dto';
import { VotePosterDto } from './dto/vote-poster.dto';
import { Poster } from './interfaces/poster.interface';
import { ResponseDto } from 'src/common/response.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('events/:eventId/posters')
export class PostersController {
  constructor(private readonly postersService: PostersService) {}

  @Get('search')
  async findWithFilters(
    @Param('eventId') eventId: string,
    @Query() paginationDto: PaginationDto,
  ): Promise<ResponseDto<any>> {
    const result = await this.postersService.findWithFilters(eventId, paginationDto);
    return result.items.length > 0
      ? new ResponseDto('success', 'Posters encontrados', result)
      : new ResponseDto('error', 'No se encontraron posters');
  }

  @Get()
  async findAll(
    @Param('eventId') eventId: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const result = await this.postersService.findWithFilters(eventId, paginationDto);
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
  async findOne(@Param('id') id: string): Promise<ResponseDto<Poster>> {
    const result = await this.postersService.findOne(id);
    return result
      ? new ResponseDto('success', 'Poster encontrado', result)
      : new ResponseDto('error', 'No se encontró el poster');
  }

  @Post()
  async create(
    @Param('eventId') eventId: string,
    @Body(new ValidationPipe()) createPosterDto: CreatePosterDto,
  ): Promise<ResponseDto<Poster>> {
    const result = await this.postersService.create({ ...createPosterDto, eventId });
    return result
      ? new ResponseDto('success', 'Poster creado', result)
      : new ResponseDto('error', 'No se pudo crear el poster');
  }

  @Patch(':id')
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body(new ValidationPipe()) updatePosterDto: UpdatePosterDto,
  ): Promise<ResponseDto<Poster>> {
    const result = await this.postersService.update(id, updatePosterDto);
    return result
      ? new ResponseDto('success', 'Poster actualizado', result)
      : new ResponseDto('error', 'No se pudo actualizar el poster');
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<ResponseDto<Poster>> {
    const result = await this.postersService.remove(id);
    return result
      ? new ResponseDto('success', 'Poster eliminado', result)
      : new ResponseDto('error', 'No se pudo eliminar el poster');
  }

  @Post(':id/vote')
  async voteForPoster(
    @Param('id') posterId: string,
    @Body() votePosterDto: VotePosterDto,
  ): Promise<ResponseDto<Poster>> {
    const { userId } = votePosterDto;
    if (!userId) throw new BadRequestException('User ID is required');
    try {
      const result = await this.postersService.voteForPoster(posterId, userId);
      return new ResponseDto('success', 'Vote registered successfully', result);
    } catch (error) {
      return new ResponseDto('error', error.message);
    }
  }
}
