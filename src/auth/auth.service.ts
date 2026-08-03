import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  BCRYPT_SALT_ROUNDS,
  DEFAULT_JWT_EXPIRES_IN_SECONDS,
} from '../common/constants/auth.constant';
import { RedisService } from '../redis/redis.service';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface JwtPayload {
  sub: number;
  email: string;
}

export interface AuthUserResponse {
  id: number;
  username: string;
  email: string;
  token: string;
}

export interface AuthResponse {
  user: AuthUserResponse;
}

export interface LogoutResponse {
  message: string;
}

export interface CurrentUserResponse {
  user: Omit<User, 'password'>;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim();

    const userWithEmail =
      await this.userService.findByEmail(email);

    if (userWithEmail) {
      throw new ConflictException(
        'Email is already in use',
      );
    }

    const userWithUsername =
      await this.userService.findByUsername(
        username,
      );

    if (userWithUsername) {
      throw new ConflictException(
        'Username is already in use',
      );
    }

    const password = await bcrypt.hash(
      dto.password,
      BCRYPT_SALT_ROUNDS,
    );

    const user = await this.userService.create({
      username,
      email,
      password,
    });

    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      },
    };
  }

  async login(
    dto: LoginDto,
  ): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();

    const user =
      await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Email or password is incorrect',
      );
    }

    const isPasswordValid =
      await bcrypt.compare(
        dto.password,
        user.password,
      );

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Email or password is incorrect',
      );
    }

    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        token,
      },
    };
  }

  async logout(
    token: string,
  ): Promise<LogoutResponse> {
    if (!token) {
      throw new UnauthorizedException(
        'Access token is required',
      );
    }

    const decodedToken =
      this.jwtService.decode<{
        exp?: number;
      }>(token);

    if (!decodedToken?.exp) {
      throw new UnauthorizedException(
        'Invalid access token',
      );
    }

    const currentTimestamp =
      Math.floor(Date.now() / 1000);

    const remainingTime =
      decodedToken.exp - currentTimestamp;

    if (remainingTime > 0) {
      await this.redisService.blacklistToken(
        token,
        remainingTime,
      );
    }

    return {
      message: 'Logout successfully',
    };
  }

  async getCurrentUser(
    userId: number,
  ): Promise<CurrentUserResponse> {
    const user =
      await this.userService.findById(userId);

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

  private async generateToken(
    user: User,
  ): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
    };

    return this.jwtService.signAsync(
      payload,
      {
        expiresIn:
          this.getJwtExpiresInSeconds(),
      },
    );
  }

  private getJwtExpiresInSeconds(): number {
    const configuredExpiration =
      this.configService.get<string>(
        'JWT_EXPIRES_IN',
      );

    if (!configuredExpiration) {
      return DEFAULT_JWT_EXPIRES_IN_SECONDS;
    }

    const matchedExpiration =
      configuredExpiration.match(
        /^(\d+)(s|m|h|d)?$/,
      );

    if (!matchedExpiration) {
      return DEFAULT_JWT_EXPIRES_IN_SECONDS;
    }

    const expirationValue =
      Number(matchedExpiration[1]);

    const expirationUnit =
      matchedExpiration[2] ?? 's';

    const expirationUnitInSeconds: Record<
      string,
      number
    > = {
      s: 1,
      m: 60,
      h: 60 * 60,
      d: 24 * 60 * 60,
    };

    return (
      expirationValue *
      expirationUnitInSeconds[expirationUnit]
    );
  }
}