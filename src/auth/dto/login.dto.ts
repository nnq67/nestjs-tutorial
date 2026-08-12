import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class LoginDto {
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
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  password!: string;
}
