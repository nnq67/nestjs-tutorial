import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import { ArticleSlugParamDto } from '../article/dto/article-slug-param.dto';
import { Article } from '../article/entities/article.entity';
import { AttachmentService } from '../attachment/attachment.service';
import { UserFollow } from '../profile/entities/user-follow.entity';
import { CommentIdParamDto } from './dto/comment-id-param.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  CommentDataResponseDto,
  CommentResponseDto,
  CommentsResponseDto,
} from './dto/responses/comment-response.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,

    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    @InjectRepository(UserFollow)
    private readonly userFollowRepository: Repository<UserFollow>,

    private readonly attachmentService: AttachmentService,

    private readonly i18nService: I18nService,
  ) {}

  async createComment(
    currentUserId: number,
    params: ArticleSlugParamDto,
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    const article = await this.getArticleOrFail(params.slug);

    const comment = this.commentRepository.create({
      body: dto.comment.body,
      articleId: article.id,
      authorId: currentUserId,
    });

    const createdComment = await this.commentRepository.save(comment);

    const commentData = await this.getCommentDataOrFail(
      article.id,
      createdComment.id,
      currentUserId,
    );

    return plainToInstance(
      CommentResponseDto,
      {
        comment: commentData,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async getComments(
    params: ArticleSlugParamDto,
    currentUserId?: number,
  ): Promise<CommentsResponseDto> {
    const article = await this.getArticleOrFail(params.slug);

    const comments = await this.commentRepository.find({
      where: {
        articleId: article.id,
      },
      relations: {
        author: true,
      },
      order: {
        createdAt: 'ASC',
      },
    });

    const commentResponses = await Promise.all(
      comments.map((comment) =>
        this.mapCommentToResponse(comment, currentUserId),
      ),
    );

    return plainToInstance(
      CommentsResponseDto,
      {
        comments: commentResponses,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async deleteComment(
    currentUserId: number,
    params: CommentIdParamDto,
  ): Promise<void> {
    const article = await this.getArticleOrFail(params.slug);

    const comment = await this.commentRepository.findOne({
      where: {
        id: params.id,
        articleId: article.id,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        this.i18nService.t('comment.errors.notFound'),
      );
    }

    if (comment.authorId !== currentUserId) {
      throw new ForbiddenException(
        this.i18nService.t('comment.errors.forbidden'),
      );
    }

    await this.commentRepository.remove(comment);
  }

  private async getCommentDataOrFail(
    articleId: number,
    commentId: number,
    currentUserId?: number,
  ): Promise<CommentDataResponseDto> {
    const comment = await this.commentRepository.findOne({
      where: {
        id: commentId,
        articleId,
      },
      relations: {
        author: true,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        this.i18nService.t('comment.errors.notFound'),
      );
    }

    return this.mapCommentToResponse(comment, currentUserId);
  }

  private async mapCommentToResponse(
    comment: Comment,
    currentUserId?: number,
  ): Promise<CommentDataResponseDto> {
    const [avatar, following] = await Promise.all([
      this.attachmentService.findAvatarByUserId(comment.authorId),
      this.isFollowing(currentUserId, comment.authorId),
    ]);

    return plainToInstance(
      CommentDataResponseDto,
      {
        id: comment.id,
        body: comment.body,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        author: {
          username: comment.author.username,
          bio: comment.author.bio,
          image: avatar?.url ?? null,
          following,
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async isFollowing(
    currentUserId: number | undefined,
    authorId: number,
  ): Promise<boolean> {
    if (!currentUserId || currentUserId === authorId) {
      return false;
    }

    const follow = await this.userFollowRepository.findOne({
      select: {
        id: true,
      },
      where: {
        followerId: currentUserId,
        followingId: authorId,
      },
    });

    return Boolean(follow);
  }

  private async getArticleOrFail(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
      select: {
        id: true,
        slug: true,
      },
      where: {
        slug,
      },
    });

    if (!article) {
      throw new NotFoundException(
        this.i18nService.t('article.errors.notFound'),
      );
    }

    return article;
  }
}