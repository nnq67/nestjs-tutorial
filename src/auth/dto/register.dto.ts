import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class RegisterDto {
  @ApiProperty({
    example: 'john_doe',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  username!: string;

  @ApiProperty({
    example: 'john@example.com',
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.IS_EMAIL'),
    },
  )
  email!: string;

  @ApiProperty({
    example: 'password123',
    minLength: 6,
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MinLength(6, {
    message: i18nValidationMessage('validation.MIN_LENGTH'),
  })
  password!: string;
}
