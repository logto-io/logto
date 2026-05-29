import type { RequestErrorBody } from '@logto/schemas';
import { avatarFileExtensionsLabel, isAvatarMimeType, maxUploadFileSize } from '@logto/schemas';

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

type AvatarUploadTranslate = (key: string, options?: Record<string, string>) => string;

export const getAvatarUploadErrorMessage = (
  { code }: Pick<RequestErrorBody, 'code'>,
  translate: AvatarUploadTranslate
) => {
  switch (code) {
    case 'storage.not_configured': {
      return translate('error_storage_not_configured');
    }
    case 'guard.file_size_exceeded': {
      return translate('error_file_size', { limit: formatFileSizeLimit(maxUploadFileSize) });
    }
    case 'guard.mime_type_not_allowed': {
      return translate('error_file_type', { extensions: avatarFileExtensionsLabel });
    }
    default: {
      return translate('error_upload');
    }
  }
};

export const formatFileSizeLimit = (bytes: number) => {
  const megabytes = bytes / (1024 * 1024);

  if (megabytes >= 1) {
    return `${Math.round(megabytes)} MB`;
  }

  return `${Math.round(bytes / 1024)} KB`;
};
