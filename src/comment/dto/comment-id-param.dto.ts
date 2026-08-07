import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, MaxLength, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CommentIdParamDto {
  @ApiProperty({
    example: 'how-to-train-your-dragon-a1b2c3d4',
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
  slug!: string;

  @ApiProperty({
    example: 1,
    minimum: 1,
  })
  @Type(() => Number)
  @IsInt({
    message: i18nValidationMessage('validation.IS_INT'),
  })
  @Min(1, {
    message: i18nValidationMessage('validation.MIN'),
  })
  id!: number;
}
