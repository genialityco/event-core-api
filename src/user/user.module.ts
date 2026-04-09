import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {  UserSchema } from './schemas/user.schema';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MemberSchema } from 'src/member/schemas/member.schema';
import { AttendeeSchema } from 'src/attendee/schemas/attendee.schema';
import { TravelerInfoSchema } from 'src/traveler/schemas/traveler-info.schema';
import { AuthService } from 'src/auth/auth.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'Member', schema: MemberSchema },
    { name: 'Attendee', schema: AttendeeSchema },
    { name: 'TravelerInfo', schema: TravelerInfoSchema },
  ])],
  providers: [UserService, AuthService],
  controllers: [UserController],
  exports: [MongooseModule],
})
export class UserModule {}