import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttachmentModule } from '../attachment/attachment.module';
import { UserFollow } from '../profile/entities/user-follow.entity';
import { User } from '../user/entities/user.entity';
import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Article } from './entities/article.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Article, ArticleFavorite, UserFollow, User]),
    AttachmentModule,
  ],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
