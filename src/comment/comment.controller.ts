import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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

import { ArticleSlugParamDto } from '../article/dto/article-slug-param.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { CommentService } from './comment.service';
import { CommentIdParamDto } from './dto/comment-id-param.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import {
  CommentResponseDto,
  CommentsResponseDto,
} from './dto/responses/comment-response.dto';

interface OptionalAuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Comments')
@Controller('articles/:slug/comments')
@UseInterceptors(AntiCacheInterceptor)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Add a comment to an article',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: CommentResponseDto,
  })
  createComment(
    @Req()
    request: AuthenticatedRequest,

    @Param()
    params: ArticleSlugParamDto,

    @Body()
    dto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentService.createComment(request.user.userId, params, dto);
  }

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get comments from an article',
    description: 'Authentication is optional.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: CommentsResponseDto,
  })
  getComments(
    @Req()
    request: OptionalAuthenticatedRequest,

    @Param()
    params: ArticleSlugParamDto,
  ): Promise<CommentsResponseDto> {
    return this.commentService.getComments(params, request.user?.userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a comment',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
  })
  deleteComment(
    @Req()
    request: AuthenticatedRequest,

    @Param()
    params: CommentIdParamDto,
  ): Promise<void> {
    return this.commentService.deleteComment(request.user.userId, params);
  }
}
