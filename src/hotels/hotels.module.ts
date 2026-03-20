import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HotelSchema } from './schemas/hotel.schema';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Hotel', schema: HotelSchema }])],
  providers: [HotelsService],
  controllers: [HotelsController],
})
export class HotelsModule {}
