import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpController } from './otp.controller';
import { OtpService } from './otp.service';
import { OtpSchema } from './otp.schema';
import { UserSchema } from 'src/user/schemas/user.schema';
import { MemberSchema } from 'src/member/schemas/member.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Otp', schema: OtpSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Member', schema: MemberSchema },
    ]),
  ],
  controllers: [OtpController],
  providers: [OtpService],
})
export class OtpModule {}
