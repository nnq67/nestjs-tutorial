import {
  Controller,
  Get,
  NotFoundException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import {
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_VALUE,
  EXPIRES_HEADER,
  EXPIRES_VALUE,
  PRAGMA_HEADER,
  PRAGMA_VALUE,
} from '../common/constants/http-headers.constant';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

interface CurrentUserResponse {
  user: Omit<User, 'password'>;
}

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Current user returned successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getCurrentUser(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<CurrentUserResponse> {
    this.setAntiCacheHeaders(response);

    const user =
      await this.userService.findById(
        request.user.userId,
      );

    if (!user) {
      throw new NotFoundException(
        'User not found',
      );
    }

    const {
      password: _password,
      ...userWithoutPassword
    } = user;

    return {
      user: userWithoutPassword,
    };
  }

  private setAntiCacheHeaders(
    response: Response,
  ): void {
    response.setHeader(
      CACHE_CONTROL_HEADER,
      CACHE_CONTROL_VALUE,
    );

    response.setHeader(
      PRAGMA_HEADER,
      PRAGMA_VALUE,
    );

    response.setHeader(
      EXPIRES_HEADER,
      EXPIRES_VALUE,
    );
  }
}