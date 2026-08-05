import {
  Body,
  Controller,
  Headers,
  Post,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import {
  LOGIN_RATE_LIMIT,
  LOGIN_RATE_LIMIT_TTL_MS,
} from '../common/constants/auth.constant';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  AUTHORIZATION_HEADER,
  AUTHORIZATION_SCHEME,
  CACHE_CONTROL_HEADER,
  CACHE_CONTROL_VALUE,
  EXPIRES_HEADER,
  EXPIRES_VALUE,
  PRAGMA_HEADER,
  PRAGMA_VALUE,
  SESSION_COOKIE_NAME,
} from '../common/constants/http-headers.constant';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/responses/auth-response.dto';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly i18nService: I18nService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<AuthResponseDto> {
    response.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
    response.setHeader(PRAGMA_HEADER, PRAGMA_VALUE);
    response.setHeader(EXPIRES_HEADER, EXPIRES_VALUE);

    return this.authService.register(dto);
  }

  @Post('login')
  @Throttle({
    default: {
      limit: LOGIN_RATE_LIMIT,
      ttl: LOGIN_RATE_LIMIT_TTL_MS,
    },
  })
  @ApiOperation({
    summary: 'Login',
  })
  @ApiResponse({
    status: 201,
    description: 'Login successfully',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<AuthResponseDto> {
    response.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
    response.setHeader(PRAGMA_HEADER, PRAGMA_VALUE);
    response.setHeader(EXPIRES_HEADER, EXPIRES_VALUE);

    return this.authService.login(dto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Logout and invalidate current token',
  })
  @ApiResponse({
    status: 201,
    description: 'Logout successfully',
    type: LogoutResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing access token',
  })
  async signOut(
    @Headers(AUTHORIZATION_HEADER)
    authorizationHeader: string | undefined,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<LogoutResponseDto> {
    response.setHeader(CACHE_CONTROL_HEADER, CACHE_CONTROL_VALUE);
    response.setHeader(PRAGMA_HEADER, PRAGMA_VALUE);
    response.setHeader(EXPIRES_HEADER, EXPIRES_VALUE);

    const token = this.extractBearerToken(authorizationHeader);

    const result = await this.authService.invalidateSession(token);

    response.clearCookie(SESSION_COOKIE_NAME);
    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME);

    return result;
  }

  private extractBearerToken(authorizationHeader: string | undefined): string {
    if (!authorizationHeader) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.authorizationHeaderRequired'),
      );
    }

    const [authorizationScheme, token] = authorizationHeader.split(' ');

    if (authorizationScheme !== AUTHORIZATION_SCHEME || !token) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.authorizationHeaderMustUseBearerToken'),
      );
    }

    return token;
  }
}
