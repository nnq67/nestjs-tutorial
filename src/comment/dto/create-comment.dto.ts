import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type, type TransformFnParams } from 'class-transformer';
import {
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export class CreateCommentDataDto {
  @ApiProperty({
    example: 'Great article!',
    maxLength: 2000,
  })
  @Transform(trimString)
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MaxLength(2000, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  body!: string;
}

export class CreateCommentDto {
  @ApiProperty({
    type: CreateCommentDataDto,
  })
  @ValidateNested()
  @Type(() => CreateCommentDataDto)
  comment!: CreateCommentDataDto;
}
