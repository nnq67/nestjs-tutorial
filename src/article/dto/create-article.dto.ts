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

function trimString({ value }: TransformFnParams): unknown {
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

export class CreateArticleDataDto {
  @ApiProperty({
    example: 'How to train your dragon',
    maxLength: 255,
  })
  @Transform(trimString)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  title!: string;

  @ApiProperty({
    example: 'Ever wonder how?',
    maxLength: 500,
  })
  @Transform(trimString)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MaxLength(500, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  description!: string;

  @ApiProperty({
    example: 'You have to believe.',
  })
  @Transform(trimString)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  body!: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['dragons', 'training'],
    default: [],
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

export class CreateArticleDto {
  @ApiProperty({
    type: CreateArticleDataDto,
  })
  @ValidateNested()
  @Type(() => CreateArticleDataDto)
  article!: CreateArticleDataDto;
}
