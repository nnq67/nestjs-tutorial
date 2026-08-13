import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ProfileDto {
  @ApiProperty({
    example: 'john_doe',
  })
  @Expose()
  username!: string;

  @ApiProperty({
    example: 'Backend developer learning NestJS',
    nullable: true,
  })
  @Expose()
  bio!: string | null;

  @ApiProperty({
    example: '/public/uploads/avatars/avatar.webp',
    nullable: true,
  })
  @Expose()
  image!: string | null;

  @ApiProperty({
    example: true,
  })
  @Expose()
  following!: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({
    type: ProfileDto,
  })
  @Expose()
  @Type(() => ProfileDto)
  profile!: ProfileDto;
}
