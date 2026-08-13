import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AttachmentService } from './attachment.service';
import { Attachment } from './entities/attachment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  providers: [AttachmentService],
  exports: [AttachmentService],
})
export class AttachmentModule {}
