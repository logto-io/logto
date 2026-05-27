import { maxUploadFileSize } from '@logto/schemas';

export const allowedAvatarMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
] as const;

export type AllowedAvatarMimeType = (typeof allowedAvatarMimeTypes)[number];

export const avatarFileAccept = [...allowedAvatarMimeTypes].join(',');

export const avatarFileExtensions = 'JPEG, PNG, GIF, WebP, BMP';

export const isAllowedAvatarMimeType = (mimeType: string): mimeType is AllowedAvatarMimeType =>
  allowedAvatarMimeTypes.includes(mimeType);

export const validateAvatarFile = (file: File): 'file_size_exceeded' | 'file_type' | undefined => {
  if (file.size > maxUploadFileSize) {
    return 'file_size_exceeded';
  }

  if (!isAllowedAvatarMimeType(file.type)) {
    return 'file_type';
  }

  return undefined;
};

export const formatFileSizeLimit = (bytes: number) => {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${Math.round(megabytes)} MB`;
  }

  return `${Math.round(bytes / 1024)} KB`;
};
