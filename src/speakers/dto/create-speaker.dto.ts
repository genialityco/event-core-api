import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
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
  readonly roleEN?: string;

  @IsString()
  @IsOptional()
  readonly organization?: string;

  @IsString()
  @IsOptional()
  readonly location?: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  readonly country: string;

  @IsString()
  @IsNotEmpty()
  readonly imageUrl: string;

  @Transform(({ value }) => new Types.ObjectId(value))
  @IsNotEmpty()
  readonly eventId: Types.ObjectId;
}
