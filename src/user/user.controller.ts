import {
  Body,
  Controller,
  Get,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { AVATAR_MAX_SIZE_IN_BYTES } from '../attachment/attachment.constant';
import type { UploadedAvatarFile } from '../attachment/interfaces/uploaded-avatar-file.interface';
import { AvatarValidationPipe } from '../attachment/pipes/avatar-validation.pipe';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/strategies/jwt.strategy';
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
} from '../common/constants/auth.constant';
import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { CurrentUserResponseDto } from './dto/responses/current-user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';

interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@ApiTags('User')
@ApiBearerAuth()
@Controller('user')
@UseGuards(JwtAuthGuard)
@UseInterceptors(AntiCacheInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
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

  @Put()
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: {
        fileSize: AVATAR_MAX_SIZE_IN_BYTES,
        files: 1,
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'Update current user and avatar',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'john_doe',
          minLength: 3,
          maxLength: 50,
          description: 'Optional new username',
        },
        email: {
          type: 'string',
          format: 'email',
          example: 'john@example.com',
          maxLength: 320,
          description: 'Optional new email',
        },
        password: {
          type: 'string',
          example: 'securePassword123',
          minLength: PASSWORD_MIN_LENGTH,
          maxLength: PASSWORD_MAX_LENGTH,
          description: 'Optional new password',
        },
        bio: {
          type: 'string',
          example: 'Backend developer learning NestJS',
          maxLength: 500,
          nullable: true,
          description:
            'Optional biography. Submit an empty value to remove the current bio.',
        },
        avatar: {
          type: 'string',
          format: 'binary',
          description:
            'Optional avatar. Supported formats: JPEG, PNG and WEBP.',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully',
    type: CurrentUserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid user data or avatar',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing access token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  updateCurrentUser(
    @Req()
    request: AuthenticatedRequest,

    @Body()
    dto: UpdateUserDto,

    @UploadedFile(AvatarValidationPipe)
    avatar?: UploadedAvatarFile,
  ): Promise<CurrentUserResponseDto> {
    return this.userService.updateCurrentUser(request.user.userId, dto, avatar);
  }
}
