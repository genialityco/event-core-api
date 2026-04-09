import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class CreateUsefulInfoDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  title_en?: string;

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  content_en?: string;

  @IsString()
  @IsOptional()
  coverImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isPublished?: boolean;

  @IsNumber()
  @IsOptional()
  order?: number;
}
