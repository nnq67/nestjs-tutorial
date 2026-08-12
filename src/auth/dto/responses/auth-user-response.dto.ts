import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthUserResponseDto {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    example: 'john_doe',
  })
  @Expose()
  username!: string;

  @ApiProperty({
    example: 'john@example.com',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'JWT access token',
  })
  @Expose()
  token!: string;
}
