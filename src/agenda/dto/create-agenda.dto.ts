import {
  IsNotEmpty,
  IsArray,
  IsString,
  IsOptional,
  IsMongoId,
  IsISO8601,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateAgendaDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly eventId: string;

  @IsOptional()
  @IsString()
  readonly dressCode?: string;

  @IsOptional()
  @IsString()
  readonly dressCodeEn?: string;

  @IsOptional()
  @IsString()
  readonly room?: string;

  @IsOptional()
  @IsString()
  readonly roomEn?: string;

  @IsArray()
  @ArrayNotEmpty()
  readonly sessions: SessionDto[];
}

export class SessionDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly titleEn?: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly startDateTime: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly endDateTime: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  readonly speakers: string[];

  @IsOptional()
  @IsMongoId()
  readonly moduleId?: string;

  @IsOptional()
  @IsString()
  readonly room?: string;

  @IsOptional()
  @IsString()
  readonly roomEn?: string;

  @IsOptional()
  @IsString()
  readonly typeSession?: string;

  @IsOptional()
  @IsString()
  readonly typeSessionEn?: string;

  @IsOptional()
  @IsArray()
  readonly subSessions?: subSessionDto[];
}
export class subSessionDto {
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly titleEn?: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly startDateTime: string;

  @IsISO8601()
  @IsNotEmpty()
  readonly endDateTime: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsMongoId({ each: true })
  readonly speakers: string[];

  @IsOptional()
  @IsMongoId()
  readonly moduleId?: string;

  @IsOptional()
  @IsString()
  readonly room?: string;

  @IsOptional()
  @IsString()
  readonly roomEn?: string;
}
