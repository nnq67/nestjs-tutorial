import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import {
  GLOBAL_RATE_LIMIT,
  GLOBAL_RATE_LIMIT_TTL_MS,
} from '../common/constants/auth.constant';
import { RedisModule } from '../redis/redis.module';
import { UserModule } from '../user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UserModule,
    RedisModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),

    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: GLOBAL_RATE_LIMIT_TTL_MS,
        limit: GLOBAL_RATE_LIMIT,
      },
    ]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
