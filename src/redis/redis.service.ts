import {
  Inject,
  Injectable,
  OnModuleDestroy,
} from '@nestjs/common';
import type Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redis: Redis,
  ) {}

  async blacklistToken(
    token: string,
    ttlInSeconds: number,
  ): Promise<void> {
    if (ttlInSeconds > 0) {
      await this.redis.set(
        `blacklist:${token}`,
        '1',
        'EX',
        ttlInSeconds,
      );
    }
  }

  async isBlacklisted(
    token: string,
  ): Promise<boolean> {
    const result = await this.redis.get(
      `blacklist:${token}`,
    );

    return result !== null;
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}