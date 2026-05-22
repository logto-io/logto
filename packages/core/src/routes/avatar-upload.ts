import { readFile } from 'node:fs/promises';
import path from 'node:path';

import {
  maxUploadFileSize,
  mimeTypeToFileExtensionMappings,
  type uploadFileGuard,
  type UserAssets,
  type StorageProviderData,
} from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { format } from 'date-fns';
import { type z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';
import { buildUploadFile } from '#src/utils/storage/index.js';

type UploadedFile = z.infer<typeof uploadFileGuard>;

type AllowedAvatarMimeType =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/bmp';

const allowedAvatarMimeTypes = new Set<AllowedAvatarMimeType>([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/bmp',
]);

const maxSafeFilenameLength = 128;

const startsWith = (buffer: Uint8Array, bytes: number[]) =>
  bytes.every((byte, index) => buffer[index] === byte);

const includesAt = (buffer: Uint8Array, offset: number, bytes: number[]) =>
  bytes.every((byte, index) => buffer[offset + index] === byte);

const readUint32Le = (buffer: Uint8Array, offset: number) =>
  new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength).getUint32(offset, true);

const binaryAvatarMimeTypeDetectors: ReadonlyArray<{
  mimeType: AllowedAvatarMimeType;
  matches: (buffer: Uint8Array) => boolean;
}> = [
  { mimeType: 'image/jpeg', matches: (buffer) => startsWith(buffer, [0xff, 0xd8, 0xff]) },
  {
    mimeType: 'image/png',
    matches: (buffer) => startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  },
  { mimeType: 'image/gif', matches: (buffer) => startsWith(buffer, [0x47, 0x49, 0x46, 0x38]) },
  { mimeType: 'image/bmp', matches: (buffer) => startsWith(buffer, [0x42, 0x4d]) },
  {
    mimeType: 'image/webp',
    matches: (buffer) =>
      startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) &&
      includesAt(buffer, 8, [0x57, 0x45, 0x42, 0x50]),
  },
];

export const detectAvatarMimeType = (
  buffer: Uint8Array
): AllowedAvatarMimeType | 'image/svg+xml' | undefined => {
  const detector = binaryAvatarMimeTypeDetectors.find(({ matches }) => matches(buffer));

  if (detector) {
    return detector.mimeType;
  }

  const text = Buffer.from(buffer.subarray(0, 512)).toString('utf8').trimStart().toLowerCase();

  if (text.startsWith('<svg') || (text.startsWith('<?xml') && text.includes('<svg'))) {
    return 'image/svg+xml';
  }
};

const hasValidJpegEndMarker = (buffer: Uint8Array) =>
  buffer.at(-2) === 0xff && buffer.at(-1) === 0xd9;

const hasValidPngEndMarker = (buffer: Uint8Array) =>
  buffer.length >= 8 &&
  includesAt(buffer, buffer.length - 8, [0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);

const hasValidGifEndMarker = (buffer: Uint8Array) => buffer.at(-1) === 0x3b;

const hasValidWebpEndMarker = (buffer: Uint8Array) =>
  buffer.length >= 12 && buffer.length === readUint32Le(buffer, 4) + 8;

const hasValidBmpEndMarker = (buffer: Uint8Array) =>
  buffer.length >= 6 && buffer.length === readUint32Le(buffer, 2);

const avatarEndMarkerValidators: Record<AllowedAvatarMimeType, (buffer: Uint8Array) => boolean> = {
  'image/jpeg': hasValidJpegEndMarker,
  'image/png': hasValidPngEndMarker,
  'image/gif': hasValidGifEndMarker,
  'image/webp': hasValidWebpEndMarker,
  'image/bmp': hasValidBmpEndMarker,
};

const hasValidAvatarEndMarker = (buffer: Uint8Array, mimeType: AllowedAvatarMimeType) =>
  buffer.length > 0 && avatarEndMarkerValidators[mimeType](buffer);

export const isAllowedAvatarMimeType = (
  mimeType: AllowedAvatarMimeType | 'image/svg+xml' | undefined
): mimeType is AllowedAvatarMimeType => {
  if (mimeType === undefined) {
    return false;
  }

  for (const allowed of allowedAvatarMimeTypes) {
    if (allowed === mimeType) {
      return true;
    }
  }

  return false;
};

export const sanitizeFilename = (filename: string, mimeType: AllowedAvatarMimeType) => {
  const [extension] = mimeTypeToFileExtensionMappings[mimeType];
  const fallbackFilename = `${generateStandardId(8)}.${extension}`;
  const basename = path.basename(filename).replaceAll(/[^\w.-]/g, '-');
  const safeFilename = basename.slice(0, maxSafeFilenameLength);

  return safeFilename || fallbackFilename;
};

export const uploadAvatar = async ({
  file,
  storageProviderConfig,
  objectKeyPrefix,
  logError,
}: {
  file: UploadedFile;
  storageProviderConfig?: StorageProviderData;
  objectKeyPrefix: string;
  logError: (error: unknown) => void;
}): Promise<UserAssets> => {
  assertThat(file.size <= maxUploadFileSize, 'guard.file_size_exceeded');

  const fileContent = await readFile(file.filepath);
  const contentType = detectAvatarMimeType(fileContent);
  const avatarMimeType = isAllowedAvatarMimeType(contentType) ? contentType : undefined;

  assertThat(avatarMimeType, 'guard.mime_type_not_allowed');
  assertThat(hasValidAvatarEndMarker(fileContent, avatarMimeType), 'guard.mime_type_not_allowed');
  assertThat(storageProviderConfig, 'storage.not_configured');

  const uploadFile = buildUploadFile(storageProviderConfig);
  const objectKey = `${objectKeyPrefix}/${format(new Date(), 'yyyy/MM/dd')}/${generateStandardId(
    8
  )}-${sanitizeFilename(file.originalFilename, avatarMimeType)}`;

  try {
    return await uploadFile(fileContent, objectKey, {
      contentType: avatarMimeType,
      publicUrl: storageProviderConfig.publicUrl,
    });
  } catch (error: unknown) {
    logError(error);
    throw new RequestError({
      code: 'storage.upload_error',
      status: 500,
    });
  }
};
