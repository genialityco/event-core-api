import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Types } from 'mongoose';

export class CreateSpeakerDto {
  @IsString()
  @IsNotEmpty()
  readonly names: string;

  @IsString()
  @IsOptional()
  readonly description?: string;

  @IsString()
  @IsOptional()
  readonly descriptionEN?: string;

  @IsString()
  @IsOptional()
  readonly role?: string;

  @IsString()
  @IsOptional()
  readonly organization?: string;

  @IsString()
  @IsOptional()
  readonly location?: string;

  @IsBoolean()
  @IsNotEmpty()
  readonly isInternational: boolean;

  @IsString()
  @IsNotEmpty()
  readonly imageUrl: string;

  @Transform(({ value }) => new Types.ObjectId(value))
  @IsNotEmpty()
  readonly eventId: Types.ObjectId;
}
