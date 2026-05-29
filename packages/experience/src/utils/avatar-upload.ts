import { isAvatarMimeType, maxUploadFileSize } from '@logto/schemas';

export type { AvatarMimeType as AllowedAvatarMimeType } from '@logto/schemas';
export {
  avatarFileAccept,
  avatarFileExtensionsLabel as avatarFileExtensions,
  avatarMimeTypes as allowedAvatarMimeTypes,
  isAvatarMimeType as isAllowedAvatarMimeType,
} from '@logto/schemas';

export const validateAvatarFile = (file: File): 'file_size_exceeded' | 'file_type' | undefined => {
  if (file.size > maxUploadFileSize) {
    return 'file_size_exceeded';
  }

  if (!isAvatarMimeType(file.type)) {
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
