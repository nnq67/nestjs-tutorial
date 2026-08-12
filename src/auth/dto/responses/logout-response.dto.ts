import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class LogoutResponseDto {
  @ApiProperty({
    example: 'Logout successfully',
  })
  @Expose()
  message!: string;
}
