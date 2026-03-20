import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TravelerInfoSchema } from './schemas/traveler-info.schema';
import { TravelerFormConfigSchema } from './schemas/traveler-form-config.schema';
import { TravelerService } from './traveler.service';
import { TravelerController } from './traveler.controller';
import { TravelerFormConfigService } from './traveler-form-config.service';
import { TravelerFormConfigController } from './traveler-form-config.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'TravelerInfo', schema: TravelerInfoSchema },
      { name: 'TravelerFormConfig', schema: TravelerFormConfigSchema },
    ]),
  ],
  controllers: [TravelerController, TravelerFormConfigController],
  providers: [TravelerService, TravelerFormConfigService],
})
export class TravelerModule {}
