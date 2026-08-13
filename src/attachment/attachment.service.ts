import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';

import {
  AVATAR_MAX_SIZE_IN_BYTES,
  AVATAR_MAX_SIZE_IN_MB,
  AVATAR_MIME_TYPE_EXTENSIONS,
  AVATAR_PUBLIC_URL_PREFIX,
  AVATAR_UPLOAD_DIRECTORY,
  USER_ATTACHABLE_TYPE,
} from './attachment.constant';
import { Attachment } from './entities/attachment.entity';
import type { UploadedAvatarFile } from './interfaces/uploaded-avatar-file.interface';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,

    private readonly i18nService: I18nService,
  ) {}

  findAvatarByUserId(userId: number): Promise<Attachment | null> {
    return this.attachmentRepository.findOne({
      where: {
        attachableType: USER_ATTACHABLE_TYPE,
        attachableId: userId,
      },
    });
  }

  validateAvatar(file: UploadedAvatarFile): void {
    this.getAvatarExtension(file.mimetype);

    if (file.size > AVATAR_MAX_SIZE_IN_BYTES) {
      throw new BadRequestException(
        this.i18nService.t('user.errors.avatarTooLarge', {
          args: {
            maxSize: AVATAR_MAX_SIZE_IN_MB,
          },
        }),
      );
    }

    if (!Buffer.isBuffer(file.buffer)) {
      throw new BadRequestException(
        this.i18nService.t('user.errors.avatarInvalid'),
      );
    }
  }

  async createOrReplaceAvatar(
    userId: number,
    file: UploadedAvatarFile,
  ): Promise<Attachment> {
    this.validateAvatar(file);

    const existingAttachment = await this.findAvatarByUserId(userId);

    const extension = this.getAvatarExtension(file.mimetype);

    const storedFileName = `${randomUUID()}.${extension}`;

    const uploadDirectory = join(process.cwd(), AVATAR_UPLOAD_DIRECTORY);

    const absoluteFilePath = join(uploadDirectory, storedFileName);

    const publicUrl = `${AVATAR_PUBLIC_URL_PREFIX}` + `/${storedFileName}`;

    await this.writeAvatarFile(uploadDirectory, absoluteFilePath, file.buffer);

    const attachment =
      existingAttachment ??
      this.attachmentRepository.create({
        id: randomUUID(),

        attachableType: USER_ATTACHABLE_TYPE,

        attachableId: userId,
      });

    const previousUrl = existingAttachment?.url;

    attachment.url = publicUrl;

    attachment.fileName = file.originalname;

    attachment.fileType = file.mimetype;

    attachment.fileSize = file.size;

    let savedAttachment: Attachment;

    try {
      savedAttachment = await this.attachmentRepository.save(attachment);
    } catch {
      await this.removeFileBestEffort(absoluteFilePath);

      throw new InternalServerErrorException(
        this.i18nService.t('user.errors.avatarStorageFailed'),
      );
    }

    if (previousUrl && previousUrl !== publicUrl) {
      await this.deleteStoredFile(previousUrl);
    }

    return savedAttachment;
  }

  private async writeAvatarFile(
    uploadDirectory: string,
    absoluteFilePath: string,
    buffer: Buffer,
  ): Promise<void> {
    try {
      await mkdir(uploadDirectory, {
        recursive: true,
      });

      await writeFile(absoluteFilePath, buffer);
    } catch {
      throw new InternalServerErrorException(
        this.i18nService.t('user.errors.avatarStorageFailed'),
      );
    }
  }

  private getAvatarExtension(mimeType: string): string {
    const extension = AVATAR_MIME_TYPE_EXTENSIONS[mimeType];

    if (!extension) {
      throw new BadRequestException(
        this.i18nService.t('user.errors.avatarInvalidType', {
          args: {
            supportedTypes: 'JPEG, PNG, WEBP',
          },
        }),
      );
    }

    return extension;
  }

  private async deleteStoredFile(publicUrl: string): Promise<void> {
    const storedFileName = basename(publicUrl);

    const absoluteFilePath = join(
      process.cwd(),
      AVATAR_UPLOAD_DIRECTORY,
      storedFileName,
    );

    await this.removeFileBestEffort(absoluteFilePath);
  }

  private async removeFileBestEffort(absoluteFilePath: string): Promise<void> {
    await Promise.allSettled([
      rm(absoluteFilePath, {
        force: true,
      }),
    ]);
  }
}
