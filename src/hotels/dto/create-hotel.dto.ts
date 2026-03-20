import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsMongoId, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateHotelDto {
  @IsMongoId() @IsNotEmpty() organizationId: string;
  @IsMongoId() @IsNotEmpty() eventId: string;
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() price?: string;
  @IsString() @IsOptional() bookingUrl?: string;
  @IsString() @IsOptional() hotelUrl?: string;
  @IsString() @IsOptional() imageUrl?: string;
  @IsBoolean() @IsOptional() isMain?: boolean;
  @IsNumber() @IsOptional() @Type(() => Number) distanceMinutes?: number;
  @IsNumber() @IsOptional() @Type(() => Number) order?: number;
}
