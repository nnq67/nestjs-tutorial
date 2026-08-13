import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import {
  AVATAR_MAX_SIZE_IN_BYTES,
  AVATAR_MAX_SIZE_IN_MB,
  AVATAR_MIME_TYPE_EXTENSIONS,
} from '../attachment.constant';
import type { UploadedAvatarFile } from '../interfaces/uploaded-avatar-file.interface';

@Injectable()
export class AvatarValidationPipe implements PipeTransform<
  UploadedAvatarFile | undefined,
  UploadedAvatarFile | undefined
> {
  constructor(private readonly i18nService: I18nService) {}

  transform(
    file: UploadedAvatarFile | undefined,
  ): UploadedAvatarFile | undefined {
    if (!file) {
      return undefined;
    }

    const extension = AVATAR_MIME_TYPE_EXTENSIONS[file.mimetype];

    if (!extension) {
      throw new BadRequestException(
        this.i18nService.t('user.errors.avatarInvalidType', {
          args: {
            supportedTypes: 'JPEG, PNG, WEBP',
          },
        }),
      );
    }

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

    return file;
  }
}
