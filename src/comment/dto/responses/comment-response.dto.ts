import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class CommentAuthorResponseDto {
  @ApiProperty({
    example: 'john_doe',
  })
  @Expose()
  username!: string;

  @ApiProperty({
    example: 'Backend developer',
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
    example: false,
  })
  @Expose()
  following!: boolean;
}

export class CommentDataResponseDto {
  @ApiProperty({
    example: 1,
  })
  @Expose()
  id!: number;

  @ApiProperty({
    example: 'Great article!',
  })
  @Expose()
  body!: string;

  @ApiProperty({
    example: '2026-08-07T02:00:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-07T02:00:00.000Z',
  })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({
    type: CommentAuthorResponseDto,
  })
  @Expose()
  @Type(() => CommentAuthorResponseDto)
  author!: CommentAuthorResponseDto;
}

export class CommentResponseDto {
  @ApiProperty({
    type: CommentDataResponseDto,
  })
  @Expose()
  @Type(() => CommentDataResponseDto)
  comment!: CommentDataResponseDto;
}

export class CommentsResponseDto {
  @ApiProperty({
    type: [CommentDataResponseDto],
  })
  @Expose()
  @Type(() => CommentDataResponseDto)
  comments!: CommentDataResponseDto[];
}
