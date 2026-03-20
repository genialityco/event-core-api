import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsefulInfoSchema } from './schemas/useful-info.schema';
import { UsefulInfoService } from './useful-info.service';
import { UsefulInfoController } from './useful-info.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'UsefulInfo', schema: UsefulInfoSchema }])],
  providers: [UsefulInfoService],
  controllers: [UsefulInfoController],
  exports: [UsefulInfoService],
})
export class UsefulInfoModule {}
