import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { ArticleService } from './article.service';
import { ArticleSlugParamDto } from './dto/article-slug-param.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { FeedArticlesQueryDto } from './dto/feed-articles-query.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import {
  ArticleResponseDto,
  ArticlesResponseDto,
} from './dto/responses/article-response.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

interface OptionalAuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Articles')
@Controller('articles')
@UseInterceptors(AntiCacheInterceptor)
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create an article',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: ArticleResponseDto,
  })
  createArticle(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    dto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articleService.createArticle(request.user.userId, dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List articles',
    description:
      'Authentication is optional. Supports tag, author, favorited, limit and offset filters.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ArticlesResponseDto,
  })
  listArticles(
    @Req()
    request: OptionalAuthenticatedRequest,

    @Query()
    query: ListArticlesQueryDto,
  ): Promise<ArticlesResponseDto> {
    return this.articleService.listArticles(query, request.user?.userId);
  }

  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get article feed',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ArticlesResponseDto,
  })
  feedArticles(
    @Req()
    request: AuthenticatedRequest,

    @Query()
    query: FeedArticlesQueryDto,
  ): Promise<ArticlesResponseDto> {
    return this.articleService.feedArticles(request.user.userId, query);
  }

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get an article',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ArticleResponseDto,
  })
  getArticle(
    @Req()
    request: OptionalAuthenticatedRequest,

    @Param()
    params: ArticleSlugParamDto,
  ): Promise<ArticleResponseDto> {
    return this.articleService.getArticle(params, request.user?.userId);
  }

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update an article',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ArticleResponseDto,
  })
  updateArticle(
    @Req()
    request: AuthenticatedRequest,

    @Param()
    params: ArticleSlugParamDto,

    @Body()
    dto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articleService.updateArticle(request.user.userId, params, dto);
  }

  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete an article',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  deleteArticle(
    @Req()
    request: AuthenticatedRequest,

    @Param()
    params: ArticleSlugParamDto,
  ): Promise<void> {
    return this.articleService.deleteArticle(request.user.userId, params);
  }

  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Favorite an article',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ArticleResponseDto,
  })
  favoriteArticle(
    @Req()
    request: AuthenticatedRequest,

    @Param()
    params: ArticleSlugParamDto,
  ): Promise<ArticleResponseDto> {
    return this.articleService.favoriteArticle(request.user.userId, params);
  }

  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unfavorite an article',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: ArticleResponseDto,
  })
  unfavoriteArticle(
    @Req()
    request: AuthenticatedRequest,

    @Param()
    params: ArticleSlugParamDto,
  ): Promise<ArticleResponseDto> {
    return this.articleService.unfavoriteArticle(request.user.userId, params);
  }
}
