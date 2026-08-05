import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { AUTHORIZATION_SCHEME } from '../../common/constants/http-headers.constant';
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
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
      passReqToCallback: true,
      ignoreExpiration: false,
    });
  }

  async validate(
    request: Request,
    payload: JwtPayload,
  ): Promise<AuthenticatedUser> {
    const token = this.extractToken(request);

    const isBlacklisted = await this.redisService.isBlacklisted(token);

    if (isBlacklisted) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.accessTokenInvalidated'),
      );
    }

    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.invalidAccessTokenPayload'),
      );
    }

    return {
      userId: payload.sub,
      email: payload.email,
    };
  }

  private extractToken(request: Request): string {
    const authorizationHeader = request.headers.authorization;

    if (!authorizationHeader) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.authorizationHeaderRequired'),
      );
    }

    const [authorizationScheme, token] = authorizationHeader.split(' ');

    if (authorizationScheme !== AUTHORIZATION_SCHEME || !token) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.invalidAuthorizationHeader'),
      );
    }

    return token;
  }
}
