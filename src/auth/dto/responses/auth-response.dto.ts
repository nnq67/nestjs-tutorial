import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { AuthUserResponseDto } from './auth-user-response.dto';

export class AuthResponseDto {
  @ApiProperty({
    type: AuthUserResponseDto,
  })
  @Expose()
  @Type(() => AuthUserResponseDto)
  user!: AuthUserResponseDto;
}
