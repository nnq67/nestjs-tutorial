import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'string',
  })
  @IsString()
  username!: string;

  @ApiProperty({
    example: 'string',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'string',
  })
  @MinLength(6)
  password!: string;
}
