import { z } from 'zod';

export const maxUploadFileSize = 20 * 1024 * 1024; // 20 MB

// Reference: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
export const allowUploadMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/vnd.microsoft.icon',
  'image/x-icon',
  'image/svg+xml',
  'image/tiff',
  'image/webp',
  'image/bmp',
  'application/zip',
] as const;

const allowUploadMimeTypeGuard = z.enum(allowUploadMimeTypes);

export type AllowedUploadMimeType = z.infer<typeof allowUploadMimeTypeGuard>;

export const userAssetsServiceStatusGuard = z.object({
  status: z.union([z.literal('ready'), z.literal('not_configured')]),
  allowUploadMimeTypes: z.array(allowUploadMimeTypeGuard).optional(),
  maxUploadFileSize: z.number().optional(),
});

export type UserAssetsServiceStatus = z.infer<typeof userAssetsServiceStatusGuard>;

export const userAssetsGuard = z.object({
  url: z.string(),
});

export type UserAssets = z.infer<typeof userAssetsGuard>;

export const uploadFileGuard = z.object({
  filepath: z.string(),
  mimetype: z.string(),
  originalFilename: z.string(),
  size: z.number(),
});

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
  'application/zip': ['zip'],
} as const);
