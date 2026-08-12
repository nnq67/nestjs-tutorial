import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

import { UserResponseDto } from './user-response.dto';

export class CurrentUserResponseDto {
  @ApiProperty({
    type: UserResponseDto,
  })
  @Expose()
  @Type(() => UserResponseDto)
  user!: UserResponseDto;
}
