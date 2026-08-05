export const USER_ATTACHABLE_TYPE = 'User';

export const AVATAR_MAX_SIZE_IN_MB = 5;

export const AVATAR_MAX_SIZE_IN_BYTES = AVATAR_MAX_SIZE_IN_MB * 1024 * 1024;

export const AVATAR_UPLOAD_DIRECTORY = 'public/uploads/avatars';

export const AVATAR_PUBLIC_URL_PREFIX = '/public/uploads/avatars';

export const AVATAR_MIME_TYPE_EXTENSIONS: Readonly<Record<string, string>> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
