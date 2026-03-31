import { IsString, IsOptional, IsArray, IsObject, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

class UpdateFeaturesDto {
  @IsOptional() @IsBoolean() agenda?: boolean;
  @IsOptional() @IsBoolean() speakers?: boolean;
  @IsOptional() @IsBoolean() survey?: boolean;
  @IsOptional() @IsBoolean() certificate?: boolean;
  @IsOptional() @IsBoolean() documents?: boolean;
  @IsOptional() @IsBoolean() news?: boolean;
  @IsOptional() @IsBoolean() highlights?: boolean;
  @IsOptional() @IsBoolean() posters?: boolean;
  @IsOptional() @IsBoolean() rooms?: boolean;
  @IsOptional() @IsBoolean() traveler?: boolean;
  @IsOptional() @IsBoolean() hotels?: boolean;
  @IsOptional() @IsBoolean() attendance?: boolean;
  @IsOptional() @IsBoolean() usefulInfo?: boolean;
  @IsOptional() @IsBoolean() photos?: boolean;
  /** Tab que se muestra por defecto al iniciar sesión. null = primer tab habilitado. */
  @IsOptional() @IsString() defaultModule?: string | null;
}

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsArray()
  propertiesDefinition?: any[];

  @IsOptional()
  @IsObject()
  @Type(() => UpdateFeaturesDto)
  features?: UpdateFeaturesDto;
}
