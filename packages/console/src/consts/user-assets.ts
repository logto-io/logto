import type { AllowedUploadMimeType } from '@logto/schemas';

type MimeTypeToFileExtensionMappings = {
  [key in AllowedUploadMimeType]: readonly string[];
};

export const mimeTypeToFileExtensionMappings: MimeTypeToFileExtensionMappings = Object.freeze({
  'image/jpeg': ['jpeg', 'jpg'],
  'image/png': ['png'],
  'image/gif': ['gif'],
  'image/vnd.microsoft.icon': ['ico'],
  'image/x-icon': ['ico'],
  'image/svg+xml': ['svg'],
  'image/tiff': ['tif', 'tiff'],
  'image/webp': ['webp'],
  'image/bmp': ['bmp'],
} as const);
