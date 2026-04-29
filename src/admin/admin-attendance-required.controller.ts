import { Controller, Get, Param } from '@nestjs/common'
import { AdminAttendanceRequiredService } from './admin-attendance-required.service'

@Controller('admin/events/:eventId/attendance-required')
export class AdminAttendanceRequiredController {
  constructor(private readonly service: AdminAttendanceRequiredService) {}

  @Get()
  async findByEvent(@Param('eventId') eventId: string) {
    return this.service.findByEvent(eventId)
  }
}