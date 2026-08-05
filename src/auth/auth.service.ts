import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { I18nService } from 'nestjs-i18n';

import {
  BCRYPT_SALT_ROUNDS,
  DEFAULT_JWT_EXPIRES_IN_SECONDS,
} from '../common/constants/auth.constant';
import { RedisService } from '../redis/redis.service';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/responses/auth-response.dto';
import { LogoutResponseDto } from './dto/responses/logout-response.dto';

interface JwtPayload {
  sub: number;
  email: string;
}

interface AuthUserData {
  id: number;
  username: string;
  email: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly i18nService: I18nService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();

    const username = dto.username.trim();

    const userWithEmail = await this.userService.findByEmail(email);

    if (userWithEmail) {
      throw new ConflictException(
        this.i18nService.t('auth.errors.emailAlreadyInUse'),
      );
    }

    const userWithUsername = await this.userService.findByUsername(username);

    if (userWithUsername) {
      throw new ConflictException(
        this.i18nService.t('auth.errors.usernameAlreadyInUse'),
      );
    }

    const password = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.userService.create({
      username,
      email,
      password,
    });

    const token = await this.generateToken(user);

    return this.createAuthResponse(user, token);
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();

    const user = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.invalidCredentials'),
      );
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.invalidCredentials'),
      );
    }

    const token = await this.generateToken(user);

    return this.createAuthResponse(user, token);
  }

  async invalidateSession(token: string): Promise<LogoutResponseDto> {
    if (!token) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.accessTokenRequired'),
      );
    }

    const decodedToken = this.jwtService.decode<{
      exp?: number;
    }>(token);

    if (!decodedToken?.exp) {
      throw new UnauthorizedException(
        this.i18nService.t('auth.errors.invalidAccessToken'),
      );
    }

    const currentTimestamp = Math.floor(Date.now() / 1000);

    const remainingTime = decodedToken.exp - currentTimestamp;

    if (remainingTime > 0) {
      await this.redisService.blacklistToken(token, remainingTime);
    }

    return plainToInstance(
      LogoutResponseDto,
      {
        message: this.i18nService.t('auth.success.logout'),
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private createAuthResponse(
    user: AuthUserData,
    token: string,
  ): AuthResponseDto {
    return plainToInstance(
      AuthResponseDto,
      {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          token,
        },
      },
      {
        excludeExtraneousValues: true,
      },
    );
  }

  private async generateToken(user: AuthUserData): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(payload, {
      expiresIn: this.getJwtExpiresInSeconds(),
    });
  }

  private getJwtExpiresInSeconds(): number {
    const configuredExpiration =
      this.configService.get<string>('JWT_EXPIRES_IN');

    if (!configuredExpiration) {
      return DEFAULT_JWT_EXPIRES_IN_SECONDS;
    }

    const matchedExpiration = configuredExpiration.match(/^(\d+)(s|m|h|d)?$/);

    if (!matchedExpiration) {
      return DEFAULT_JWT_EXPIRES_IN_SECONDS;
    }

    const expirationValue = Number(matchedExpiration[1]);

    const expirationUnit = matchedExpiration[2] ?? 's';

    const expirationUnitInSeconds: Record<string, number> = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return expirationValue * expirationUnitInSeconds[expirationUnit];
  }
}
