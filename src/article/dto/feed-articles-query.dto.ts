import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const DEFAULT_OFFSET = 0;

export class FeedArticlesQueryDto {
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
}
