import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import {
  ExtractJwt,
  Strategy,
} from 'passport-jwt';

import {
  AUTHORIZATION_SCHEME,
} from '../../common/constants/http-headers.constant';
import { RedisService } from '../../redis/redis.service';

export interface JwtPayload {
  sub: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedUser {
  userId: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
) {
  constructor(
    configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest:
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        configService.getOrThrow<string>(
          'JWT_SECRET',
        ),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<AuthenticatedUser> {
    const token = this.extractToken(request);

    const isBlacklisted =
      await this.redisService.isBlacklisted(token);

    if (isBlacklisted) {
      throw new UnauthorizedException(
        'Access token has been invalidated',
      );
    }

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException(
        'Invalid access token payload',
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
    };
  }

  private extractToken(request: Request): string {
    const authorizationHeader =
      request.headers.authorization;

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
        'Invalid authorization header',
      );
    }

    return token;
  }
}