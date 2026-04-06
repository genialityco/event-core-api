import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminOrganizationsController } from './admin-organizations.controller';
import { AdminEventsController } from './admin-events.controller';
import { AdminTravelerFormConfigController } from './admin-traveler-form-config.controller';
import { AdminHotelsController } from './admin-hotels.controller';
import { AdminAgendaController } from './admin-agenda.controller';
import { AdminSpeakersController } from './admin-speakers.controller';
import { AdminPhotosController } from './admin-photos.controller';
import { AdminUsefulInfoController } from './admin-useful-info.controller';
import { AdminTravelersController } from './admin-travelers.controller';
import { OrganizationModule } from 'src/organization/organization.module';
import { UsefulInfoSchema } from 'src/useful-info/schemas/useful-info.schema';
import { EventSchema } from 'src/event/schemas/event.schema';
import { TravelerFormConfigSchema } from 'src/traveler/schemas/traveler-form-config.schema';
import { TravelerInfoSchema } from 'src/traveler/schemas/traveler-info.schema';
import { UserSchema } from 'src/user/schemas/user.schema';
import { HotelSchema } from 'src/hotels/schemas/hotel.schema';
import { AgendaSchema } from 'src/agenda/schemas/agenda.schema';
import { SpeakerSchema } from 'src/speakers/schemas/speakers.schema';
import { PhotoSchema } from 'src/photos/schemas/photo.schema';

@Module({
  imports: [
    OrganizationModule,
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'TravelerFormConfig', schema: TravelerFormConfigSchema },
      { name: 'TravelerInfo', schema: TravelerInfoSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Hotel', schema: HotelSchema },
      { name: 'Agenda', schema: AgendaSchema },
      { name: 'Speaker', schema: SpeakerSchema },
      { name: 'Photo', schema: PhotoSchema },
      { name: 'UsefulInfo', schema: UsefulInfoSchema },
    ]),
  ],
  controllers: [
    AdminOrganizationsController,
    AdminEventsController,
    AdminTravelerFormConfigController,
    AdminHotelsController,
    AdminAgendaController,
    AdminSpeakersController,
    AdminPhotosController,
    AdminUsefulInfoController,
    AdminTravelersController,
  ],
})
export class AdminModule {}
