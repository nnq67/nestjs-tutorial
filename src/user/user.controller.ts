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
import { plainToInstance } from 'class-transformer';
import type { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';

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
import { CurrentUserResponseDto } from './dto/responses/current-user-response.dto';
import { UserService } from './user.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18nService: I18nService,
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
    type: CurrentUserResponseDto,
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
  ): Promise<CurrentUserResponseDto> {
    response.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
    response.setHeader(PRAGMA_HEADER, PRAGMA_VALUE);
    response.setHeader(EXPIRES_HEADER, EXPIRES_VALUE);

    const user = await this.userService.findById(request.user.userId);

    if (!user) {
      throw new NotFoundException(
        this.i18nService.t('auth.errors.userNotFound'),
      );
    }

    return plainToInstance(
      CurrentUserResponseDto,
      {
        user,
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }
}
