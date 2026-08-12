import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, AntiCacheInterceptor],
  exports: [UserService],
})
export class UserModule {}
