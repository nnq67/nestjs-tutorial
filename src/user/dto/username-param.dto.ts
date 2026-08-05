import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UsernameParamDto {
  @ApiProperty({
    example: 'john_doe',
    maxLength: 50,
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @Matches(/\S/, {
    message: i18nValidationMessage('validation.NOT_BLANK'),
  })
  @MaxLength(50, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  username!: string;
}
