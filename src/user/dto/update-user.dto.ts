import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, type TransformFnParams } from 'class-transformer';
import {
  Allow,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../../common/constants/auth.constant';

function emptyStringToUndefined({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') {
    return value;
  }

  const trimmedValue = value.trim();

  if (trimmedValue === '') {
    return undefined;
  }

  return trimmedValue;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'john_doe',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @Matches(/\S/, {
    message: i18nValidationMessage('validation.NOT_BLANK'),
  })
  @MinLength(3, {
    message: i18nValidationMessage('validation.MIN_LENGTH'),
  })
  @MaxLength(50, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  username?: string;

  @ApiPropertyOptional({
    example: 'john@example.com',
    maxLength: 320,
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.IS_EMAIL'),
    },
  )
  @MaxLength(320, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  email?: string;

  @ApiPropertyOptional({
    example: 'securePassword123',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: i18nValidationMessage('validation.MIN_LENGTH'),
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  password?: string;

  @ApiPropertyOptional({
    example: 'Backend developer learning NestJS',
    maxLength: 500,
    nullable: true,
  })
  @IsOptional()
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @MaxLength(500, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  bio?: string;

  /*
   * Swagger may submit avatar="" when no file
   * is selected. The actual file is handled
   * by @UploadedFile().
   */
  @Transform(emptyStringToUndefined)
  @IsOptional()
  @Allow()
  avatar?: string;
}
