import {
  Controller,
  Get,
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
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { CurrentUserResponseDto } from './dto/responses/current-user-response.dto';
import { UserService } from './user.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('User')
@Controller('user')
@UseInterceptors(AntiCacheInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

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
  getCurrentUser(
    @Req()
    request: AuthenticatedRequest,
  ): Promise<CurrentUserResponseDto> {
    return this.userService.getCurrentUser(request.user.userId);
  }
}
