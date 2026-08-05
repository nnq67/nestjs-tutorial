import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
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
    example: '2026-08-05T01:30:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-05T01:30:00.000Z',
  })
  @Expose()
  updatedAt!: Date;
}
