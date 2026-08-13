import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HeaderResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'node:path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { AuthModule } from './auth/auth.module';
import { ProfileModule } from './profile/profile.module';
import { RedisModule } from './redis/redis.module';
import { UserModule } from './user/user.module';
import { CommentModule } from './comment/comment.module';

const GLOBAL_RATE_LIMIT_TTL_MS = 60_000;
const GLOBAL_RATE_LIMIT = 10;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        host: configService.getOrThrow<string>('DB_HOST'),

        port: configService.getOrThrow<number>('DB_PORT'),

        username: configService.getOrThrow<string>('DB_USERNAME'),

        password: configService.getOrThrow<string>('DB_PASSWORD'),

        database: configService.getOrThrow<string>('DB_NAME'),

        entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')],

        synchronize: false,
      }),
    }),

    I18nModule.forRootAsync({
      imports: [ConfigModule],

      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        const nodeEnvironment = configService.get<string>(
          'NODE_ENV',
          'development',
        );

        const isProduction = nodeEnvironment === 'production';

        const translationPath = isProduction
          ? path.join(__dirname, 'i18n')
          : path.join(process.cwd(), 'src', 'i18n');

        return {
          fallbackLanguage: 'en',

          loaderOptions: {
            path: translationPath,
            watch: !isProduction,
          },
        };
      },

      resolvers: [
        {
          use: QueryResolver,
          options: ['lang'],
        },

        new HeaderResolver(['x-custom-lang']),
      ],
    }),

    ThrottlerModule.forRoot([
      {
        ttl: GLOBAL_RATE_LIMIT_TTL_MS,
        limit: GLOBAL_RATE_LIMIT,
      },
    ]),

    RedisModule,
    AuthModule,
    UserModule,
    ProfileModule,
    ArticleModule,
    CommentModule,
  ],

  controllers: [AppController],

  providers: [
    AppService,

    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
