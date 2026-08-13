import {
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

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { UsernameParamDto } from '../user/dto/username-param.dto';
import { ProfileResponseDto } from './dto/responses/profile-response.dto';
import { ProfileService } from './profile.service';

interface OptionalAuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('Profiles')
@Controller('profiles')
@UseInterceptors(AntiCacheInterceptor)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get a user profile',
    description:
      'Authentication is optional. When authenticated, following reflects the current user relationship.',
  })
  @ApiResponse({
    status: 200,
    description: 'Profile returned successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  getProfile(
    @Param()
    params: UsernameParamDto,

    @Req()
    request: OptionalAuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profileService.getProfile(
      params.username,
      request.user?.userId,
    );
  }

  @Post(':username/follow')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Follow a user',
  })
  @ApiResponse({
    status: 200,
    description: 'User followed successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot follow yourself',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  followProfile(
    @Param()
    params: UsernameParamDto,

    @Req()
    request: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profileService.followProfile(
      request.user.userId,
      params.username,
    );
  }

  @Delete(':username/follow')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Unfollow a user',
  })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed successfully',
    type: ProfileResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot unfollow yourself',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
  })
  unfollowProfile(
    @Param()
    params: UsernameParamDto,

    @Req()
    request: AuthenticatedRequest,
  ): Promise<ProfileResponseDto> {
    return this.profileService.unfollowProfile(
      request.user.userId,
      params.username,
    );
  }
}
