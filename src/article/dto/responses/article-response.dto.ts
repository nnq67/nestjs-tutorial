import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class ArticleAuthorResponseDto {
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

export class ArticleDataResponseDto {
  @ApiProperty({
    example: 'how-to-train-your-dragon-a1b2c3d4',
  })
  @Expose()
  slug!: string;

  @ApiProperty({
    example: 'How to train your dragon',
  })
  @Expose()
  title!: string;

  @ApiProperty({
    example: 'Ever wonder how?',
  })
  @Expose()
  description!: string;

  @ApiProperty({
    example: 'You have to believe.',
  })
  @Expose()
  body!: string;

  @ApiProperty({
    type: [String],
    example: ['dragons', 'training'],
  })
  @Expose()
  tagList!: string[];

  @ApiProperty({
    example: '2026-08-06T08:00:00.000Z',
  })
  @Expose()
  createdAt!: Date;

  @ApiProperty({
    example: '2026-08-06T08:00:00.000Z',
  })
  @Expose()
  updatedAt!: Date;

  @ApiProperty({
    example: true,
  })
  @Expose()
  favorited!: boolean;

  @ApiProperty({
    example: 12,
  })
  @Expose()
  favoritesCount!: number;

  @ApiProperty({
    type: ArticleAuthorResponseDto,
  })
  @Expose()
  @Type(() => ArticleAuthorResponseDto)
  author!: ArticleAuthorResponseDto;
}

export class ArticleResponseDto {
  @ApiProperty({
    type: ArticleDataResponseDto,
  })
  @Expose()
  @Type(() => ArticleDataResponseDto)
  article!: ArticleDataResponseDto;
}

export class ArticlesResponseDto {
  @ApiProperty({
    type: [ArticleDataResponseDto],
  })
  @Expose()
  @Type(() => ArticleDataResponseDto)
  articles!: ArticleDataResponseDto[];

  @ApiProperty({
    example: 42,
  })
  @Expose()
  articlesCount!: number;
}
