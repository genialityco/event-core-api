import { Controller, Get, Param } from '@nestjs/common';
import { UsefulInfoService } from './useful-info.service';
import { ResponseDto } from 'src/common/response.dto';

@Controller('events/:eventId/useful-info')
export class UsefulInfoController {
  constructor(private readonly usefulInfoService: UsefulInfoService) {}

  @Get()
  async findAll(@Param('eventId') eventId: string) {
    const items = await this.usefulInfoService.findByEvent(eventId, true);
    return new ResponseDto('success', 'Info encontrada', items);
  }
}
