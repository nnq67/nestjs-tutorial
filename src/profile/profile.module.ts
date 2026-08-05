import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttachmentModule } from '../attachment/attachment.module';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { AntiCacheInterceptor } from '../common/interceptors/anti-cache.interceptor';
import { UserModule } from '../user/user.module';
import { UserFollow } from './entities/user-follow.entity';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserFollow]),
    UserModule,
    AttachmentModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService, OptionalJwtAuthGuard, AntiCacheInterceptor],
})
export class ProfileModule {}
