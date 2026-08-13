import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Article } from '../article/entities/article.entity';
import { AttachmentModule } from '../attachment/attachment.module';
import { UserFollow } from '../profile/entities/user-follow.entity';
import { CommentController } from './comment.controller';
import { CommentService } from './comment.service';
import { Comment } from './entities/comment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Comment, Article, UserFollow]),
    AttachmentModule,
  ],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
