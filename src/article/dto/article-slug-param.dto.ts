import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class ArticleSlugParamDto {
  @ApiProperty({
    example: 'how-to-train-your-dragon-a1b2c3d4',
    maxLength: 255,
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MaxLength(255, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  slug!: string;
}
