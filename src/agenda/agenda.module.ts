import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AgendaService } from './agenda.service';
import { AgendaController } from './agenda.controller';
import { AgendaSchema } from './schemas/agenda.schema';
import { SessionAttendanceSchema } from './schemas/session-attendance.schema';
import { SessionAttendanceService } from './session-attendance.service';
import { SessionAttendanceController } from './session-attendance.controller';
import { EventModule } from '../event/event.module';
import { SpeakersModule } from 'src/speakers/speakers.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Agenda', schema: AgendaSchema },
      { name: 'SessionAttendance', schema: SessionAttendanceSchema },
    ]),
    EventModule,
    SpeakersModule,
  ],
  providers: [AgendaService, SessionAttendanceService],
  controllers: [AgendaController, SessionAttendanceController],
})
export class AgendaModule {}
