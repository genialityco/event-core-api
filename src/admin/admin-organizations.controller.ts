import { Controller, Get, Post, Put, Patch, Delete, Param, Body, Query, ValidationPipe } from '@nestjs/common';
import { OrganizationService } from 'src/organization/organization.service';
import { CreateOrganizationDto } from 'src/organization/dto/create-organization.dto';
import { UpdateOrganizationDto } from 'src/organization/dto/update-organization.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ResponseDto } from 'src/common/response.dto';

@Controller('admin/organizations')
export class AdminOrganizationsController {
  constructor(private readonly organizationService: OrganizationService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.organizationService.findAll(paginationDto);
    return new ResponseDto('success', 'Organizaciones encontradas', result);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.organizationService.findOne(id);
    return new ResponseDto('success', 'Organización encontrada', result);
  }

  @Post()
  async create(@Body(new ValidationPipe()) dto: CreateOrganizationDto) {
    const result = await this.organizationService.create(dto);
    return new ResponseDto('success', 'Organización creada', result);
  }

  @Patch(':id')
  @Put(':id')
  async update(@Param('id') id: string, @Body(new ValidationPipe()) dto: UpdateOrganizationDto) {
    const result = await this.organizationService.update(id, dto);
    return new ResponseDto('success', 'Organización actualizada', result);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.organizationService.remove(id);
    return new ResponseDto('success', 'Organización eliminada', result);
  }
}
