import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

export class ListArticlesQueryDto {
  @ApiPropertyOptional({
    example: 'nestjs',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(50, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  tag?: string;

  @ApiPropertyOptional({
    example: 'john_doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(50, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  author?: string;

  @ApiPropertyOptional({
    example: 'jane_doe',
    maxLength: 50,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(50, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  favorited?: string;

  @ApiPropertyOptional({
    example: DEFAULT_LIMIT,
    default: DEFAULT_LIMIT,
    maximum: MAX_LIMIT,
  })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT'),
  })
  @Min(1, {
    message: i18nValidationMessage('validation.MIN'),
  })
  @Max(MAX_LIMIT, {
    message: i18nValidationMessage('validation.MAX'),
  })
  limit: number = DEFAULT_LIMIT;

  @ApiPropertyOptional({
    example: DEFAULT_OFFSET,
    default: DEFAULT_OFFSET,
    minimum: DEFAULT_OFFSET,
  })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT'),
  })
  @Min(DEFAULT_OFFSET, {
    message: i18nValidationMessage('validation.MIN'),
  })
  offset: number = DEFAULT_OFFSET;

  normalizedTag(): string | undefined {
    return this.tag?.trim().toLowerCase() || undefined;
  }

  normalizedAuthor(): string | undefined {
    return this.author?.trim() || undefined;
  }

  normalizedFavorited(): string | undefined {
    return this.favorited?.trim() || undefined;
  }
}
