import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { randomUUID } from 'node:crypto';
import { I18nService } from 'nestjs-i18n';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { AttachmentService } from '../attachment/attachment.service';
import { UserFollow } from '../profile/entities/user-follow.entity';
import { User } from '../user/entities/user.entity';
import { ArticleSlugParamDto } from './dto/article-slug-param.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { FeedArticlesQueryDto } from './dto/feed-articles-query.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import {
  ArticleDataResponseDto,
  ArticleResponseDto,
  ArticlesResponseDto,
} from './dto/responses/article-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleFavorite } from './entities/article-favorite.entity';
import { Article } from './entities/article.entity';

interface ArticleRow {
  article_id: number;
  article_slug: string;
  article_title: string;
  article_description: string;
  article_body: string;
  article_tag_list: string[];
  article_created_at: Date;
  article_updated_at: Date;
  author_id: number;
  author_username: string;
  author_bio: string | null;
  favorites_count: string;
  favorited: boolean;
  following: boolean;
}

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,

    @InjectRepository(ArticleFavorite)
    private readonly favoriteRepository: Repository<ArticleFavorite>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly attachmentService: AttachmentService,

    private readonly i18nService: I18nService,
  ) {}

  async createArticle(
    currentUserId: number,
    dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = this.articleRepository.create({
      title: dto.article.title,
      description: dto.article.description,
      body: dto.article.body,
      tagList: dto.article.tagList ?? [],
      slug: this.generateSlug(dto.article.title),
      authorId: currentUserId,
    });

    const createdArticle = await this.articleRepository.save(article);

    return this.getArticle(
      {
        slug: createdArticle.slug,
      },
      currentUserId,
    );
  }

  async listArticles(
    query: ListArticlesQueryDto,
    currentUserId?: number,
  ): Promise<ArticlesResponseDto> {
    const queryBuilder = this.createArticleListQuery(currentUserId);

    const tag = query.tag?.trim().toLowerCase();

    const author = query.author?.trim();

    const favoritedUsername = query.favorited?.trim();

    if (tag) {
      queryBuilder.andWhere(':tag = ANY(article.tag_list)', {
        tag,
      });
    }

    if (author) {
      queryBuilder.andWhere('author.username = :author', {
        author,
      });
    }

    if (favoritedUsername) {
      const favoritedUser = await this.userRepository.findOne({
        select: {
          id: true,
        },
        where: {
          username: favoritedUsername,
        },
      });

      if (!favoritedUser) {
        return plainToInstance(
          ArticlesResponseDto,
          {
            articles: [],
            articlesCount: 0,
          },
          {
            excludeExtraneousValues: true,
          },
        );
      }

      queryBuilder.andWhere((subQueryBuilder) => {
        const favoriteSubQuery = subQueryBuilder
          .subQuery()
          .select('filtered_favorite.article_id')
          .from(ArticleFavorite, 'filtered_favorite')
          .where('filtered_favorite.user_id = :favoritedUserId')
          .getQuery();

        return `article.id IN ` + favoriteSubQuery;
      });

      queryBuilder.setParameter('favoritedUserId', favoritedUser.id);
    }

    queryBuilder
      .orderBy('article.created_at', 'DESC')
      .limit(query.limit)
      .offset(query.offset);

    return this.executeArticleListQuery(queryBuilder);
  }

  async feedArticles(
    currentUserId: number,
    query: FeedArticlesQueryDto,
  ): Promise<ArticlesResponseDto> {
    const queryBuilder = this.createArticleListQuery(currentUserId);

    queryBuilder
      .innerJoin(
        UserFollow,
        'feed_follow',
        [
          'feed_follow.following_id = article.author_id',
          'feed_follow.follower_id = :feedUserId',
        ].join(' AND '),
        {
          feedUserId: currentUserId,
        },
      )
      .orderBy('article.created_at', 'DESC')
      .limit(query.limit)
      .offset(query.offset);

    return this.executeArticleListQuery(queryBuilder);
  }

  async getArticle(
    params: ArticleSlugParamDto,
    currentUserId?: number,
  ): Promise<ArticleResponseDto> {
    const queryBuilder = this.createArticleListQuery(currentUserId);

    queryBuilder.andWhere('article.slug = :slug', {
      slug: params.slug,
    });

    const row = await queryBuilder.getRawOne<ArticleRow>();

    if (!row) {
      throw new NotFoundException(
        this.i18nService.t('article.errors.notFound'),
      );
    }

    const article = await this.mapArticleRow(row);

    return plainToInstance(
      ArticleResponseDto,
      {
        article,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  async updateArticle(
    currentUserId: number,
    params: ArticleSlugParamDto,
    dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.getOwnedArticleOrFail(
      params.slug,
      currentUserId,
    );

    if (dto.article.title !== undefined) {
      article.title = dto.article.title;
    }

    if (dto.article.description !== undefined) {
      article.description = dto.article.description;
    }

    if (dto.article.body !== undefined) {
      article.body = dto.article.body;
    }

    if (dto.article.tagList !== undefined) {
      article.tagList = dto.article.tagList;
    }

    await this.articleRepository.save(article);

    return this.getArticle(
      {
        slug: article.slug,
      },
      currentUserId,
    );
  }

  async deleteArticle(
    currentUserId: number,
    params: ArticleSlugParamDto,
  ): Promise<void> {
    const article = await this.getOwnedArticleOrFail(
      params.slug,
      currentUserId,
    );

    await this.articleRepository.remove(article);
  }

  async favoriteArticle(
    currentUserId: number,
    params: ArticleSlugParamDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.getArticleEntityOrFail(params.slug);

    const existingFavorite = await this.favoriteRepository.findOne({
      where: {
        articleId: article.id,
        userId: currentUserId,
      },
    });

    if (!existingFavorite) {
      const favorite = this.favoriteRepository.create({
        articleId: article.id,
        userId: currentUserId,
      });

      await this.favoriteRepository.save(favorite);
    }

    return this.getArticle(params, currentUserId);
  }

  async unfavoriteArticle(
    currentUserId: number,
    params: ArticleSlugParamDto,
  ): Promise<ArticleResponseDto> {
    const article = await this.getArticleEntityOrFail(params.slug);

    await this.favoriteRepository.delete({
      articleId: article.id,
      userId: currentUserId,
    });

    return this.getArticle(params, currentUserId);
  }

  private createArticleListQuery(
    currentUserId?: number,
  ): SelectQueryBuilder<Article> {
    const safeCurrentUserId = currentUserId ?? 0;

    return this.articleRepository
      .createQueryBuilder('article')
      .innerJoin('article.author', 'author')
      .leftJoin(ArticleFavorite, 'favorite', 'favorite.article_id = article.id')
      .leftJoin(
        ArticleFavorite,
        'current_favorite',
        [
          'current_favorite.article_id = article.id',
          'current_favorite.user_id = :currentUserId',
        ].join(' AND '),
        {
          currentUserId: safeCurrentUserId,
        },
      )
      .leftJoin(
        UserFollow,
        'current_follow',
        [
          'current_follow.following_id = article.author_id',
          'current_follow.follower_id = :currentUserId',
        ].join(' AND '),
        {
          currentUserId: safeCurrentUserId,
        },
      )
      .select([
        'article.id AS article_id',
        'article.slug AS article_slug',
        'article.title AS article_title',
        'article.description AS article_description',
        'article.body AS article_body',
        'article.tag_list AS article_tag_list',
        'article.created_at AS article_created_at',
        'article.updated_at AS article_updated_at',
        'author.id AS author_id',
        'author.username AS author_username',
        'author.bio AS author_bio',
        'COUNT(DISTINCT favorite.id)::text AS favorites_count',
        'BOOL_OR(current_favorite.id IS NOT NULL) AS favorited',
        'BOOL_OR(current_follow.id IS NOT NULL) AS following',
      ])
      .groupBy('article.id')
      .addGroupBy('author.id');
  }

  private async executeArticleListQuery(
    queryBuilder: SelectQueryBuilder<Article>,
  ): Promise<ArticlesResponseDto> {
    const countQuery = queryBuilder.clone();

    countQuery.limit(undefined).offset(undefined).orderBy();

    const [rows, countRows] = await Promise.all([
      queryBuilder.getRawMany<ArticleRow>(),

      countQuery.select('article.id', 'article_id').distinct(true).getRawMany<{
        article_id: number;
      }>(),
    ]);

    const articles = await Promise.all(
      rows.map((row) => this.mapArticleRow(row)),
    );

    return plainToInstance(
      ArticlesResponseDto,
      {
        articles,
        articlesCount: countRows.length,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async mapArticleRow(
    row: ArticleRow,
  ): Promise<ArticleDataResponseDto> {
    const avatar = await this.attachmentService.findAvatarByUserId(
      Number(row.author_id),
    );

    return plainToInstance(
      ArticleDataResponseDto,
      {
        slug: row.article_slug,
        title: row.article_title,
        description: row.article_description,
        body: row.article_body,
        tagList: row.article_tag_list ?? [],
        createdAt: row.article_created_at,
        updatedAt: row.article_updated_at,
        favorited: Boolean(row.favorited),
        favoritesCount: Number(row.favorites_count),
        author: {
          username: row.author_username,
          bio: row.author_bio,
          image: avatar?.url ?? null,
          following: Boolean(row.following),
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async getArticleEntityOrFail(slug: string): Promise<Article> {
    const article = await this.articleRepository.findOne({
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

  private async getOwnedArticleOrFail(
    slug: string,
    currentUserId: number,
  ): Promise<Article> {
    const article = await this.getArticleEntityOrFail(slug);

    if (article.authorId !== currentUserId) {
      throw new ForbiddenException(
        this.i18nService.t('article.errors.forbidden'),
      );
    }

    return article;
  }

  private generateSlug(title: string): string {
    const normalizedTitle = title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const suffix = randomUUID().replace(/-/g, '').slice(0, 8);

    const slugPrefix = normalizedTitle || 'article';

    return `${slugPrefix.slice(0, 240)}-${suffix}`;
  }
}
