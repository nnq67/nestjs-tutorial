import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttachmentModule } from '../attachment/attachment.module';
import { AvatarValidationPipe } from '../attachment/pipes/avatar-validation.pipe';
import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AttachmentModule],
  controllers: [UserController],
  providers: [UserService, AvatarValidationPipe, AntiCacheInterceptor],
  exports: [UserService],
})
export class UserModule {}
