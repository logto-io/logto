import { mimeTypeToFileExtensionMappings, type AllowedUploadMimeType } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';

export const convertToFileExtensionArray = (mimeTypes: AllowedUploadMimeType[]) =>
  deduplicate(
    mimeTypes
      .flatMap((type) => mimeTypeToFileExtensionMappings[type])
      .map((extension) => extension.toUpperCase())
  );

// https://stackoverflow.com/a/18650828/12514940
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) {
    return '0 Bytes';
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Number.parseFloat((bytes / k ** i).toFixed(dm)) + ' ' + sizes[i];
};
