import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

function trimOptionalString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

function normalizeTagList({ value }: TransformFnParams): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  return [
    ...new Set(
      value
        .filter((tag): tag is string => typeof tag === 'string')
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  ];
}

export class UpdateArticleDataDto {
  @ApiPropertyOptional({
    example: 'How to train your dragon',
    maxLength: 255,
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  title?: string;

  @ApiPropertyOptional({
    example: 'Ever wonder how?',
    maxLength: 500,
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MaxLength(500, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  description?: string;

  @ApiPropertyOptional({
    example: 'You have to believe.',
  })
  @Transform(trimOptionalString)
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  body?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['dragons', 'training'],
  })
  @Transform(normalizeTagList)
  @IsOptional()
  @IsArray({
    message: i18nValidationMessage('validation.IS_ARRAY'),
  })
  @ArrayMaxSize(20, {
    message: i18nValidationMessage('validation.ARRAY_MAX_SIZE'),
  })
  @IsString({
    each: true,
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(50, {
    each: true,
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  tagList?: string[];
}

export class UpdateArticleDto {
  @ApiProperty({
    type: UpdateArticleDataDto,
  })
  @ValidateNested()
  @Type(() => UpdateArticleDataDto)
  article!: UpdateArticleDataDto;
}
