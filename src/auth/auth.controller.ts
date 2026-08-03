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
import {
  AuthService,
  type AuthResponse,
  type LogoutResponse,
} from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
  })
  @ApiResponse({
    status: 409,
    description: 'Email or username already exists',
  })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<AuthResponse> {
    this.setAntiCacheHeaders(response);

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
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid email or password',
  })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<AuthResponse> {
    this.setAntiCacheHeaders(response);

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
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or missing access token',
  })
  async logout(
    @Headers(AUTHORIZATION_HEADER)
    authorizationHeader: string | undefined,
    @Res({ passthrough: true })
    response: Response,
  ): Promise<LogoutResponse> {
    this.setAntiCacheHeaders(response);

    response.clearCookie(SESSION_COOKIE_NAME);
    response.clearCookie(ACCESS_TOKEN_COOKIE_NAME);

    const token =
      this.extractBearerToken(authorizationHeader);

    return this.authService.logout(token);
  }

  private extractBearerToken(
    authorizationHeader: string | undefined,
  ): string {
    if (!authorizationHeader) {
      throw new UnauthorizedException(
        'Authorization header is required',
      );
    }

    const [authorizationScheme, token] =
      authorizationHeader.split(' ');

    if (
      authorizationScheme !== AUTHORIZATION_SCHEME ||
      !token
    ) {
      throw new UnauthorizedException(
        'Authorization header must use Bearer token',
      );
    }

    return token;
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