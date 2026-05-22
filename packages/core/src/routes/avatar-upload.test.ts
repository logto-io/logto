import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { maxUploadFileSize } from '@logto/schemas';

import {
  detectAvatarMimeType,
  isAllowedAvatarMimeType,
  sanitizeFilename,
  uploadAvatar,
} from './avatar-upload.js';

const validPng = Buffer.from(
  '89504E470D0A1A0A0000000D49484452000000010000000108060000001F15C4890000000D4944415478DA63FCFFFFFF1F00040501FE6F1B5F570000000049454E44AE426082',
  'hex'
);

const noopLogError = (_error: unknown) => {
  void _error;
};

const validJpeg = Buffer.from(
  'FFD8FFE000104A46494600010100000100010000FFDB004300080606070605080707070909080A0C140D0C0B0B0C1912130F141D1A1F1E1D1A1C1C20242E2720222C231C1C2837292C30313434341F27393D38323C2E333432FFDB0043010909090C0B0C180D0D1832211C213232323232323232323232323232323232323232323232323232323232323232323232FFC00011080001000103011100021100031100FFC4001500010100000000000000000000000000000000FFC40014100100000000000000000000000000000000FFDA000C03010002110311003F00FFD9',
  'hex'
);

describe('avatar-upload validation', () => {
  it('detects allowed raster mime types', () => {
    expect(detectAvatarMimeType(validPng)).toBe('image/png');
    expect(detectAvatarMimeType(validJpeg)).toBe('image/jpeg');
  });

  it('rejects svg content', () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>', 'utf8');
    expect(detectAvatarMimeType(svg)).toBe('image/svg+xml');
    expect(isAllowedAvatarMimeType(detectAvatarMimeType(svg))).toBe(false);
  });

  it('rejects tiff and ico content', () => {
    const tiff = Buffer.from([0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00]);
    const ico = Buffer.from([0x00, 0x00, 0x01, 0x00, 0x01, 0x00]);

    expect(detectAvatarMimeType(tiff)).toBeUndefined();
    expect(detectAvatarMimeType(ico)).toBeUndefined();
    expect(isAllowedAvatarMimeType(detectAvatarMimeType(tiff))).toBe(false);
    expect(isAllowedAvatarMimeType(detectAvatarMimeType(ico))).toBe(false);
  });

  it('sanitizes unsafe filenames and falls back when empty', () => {
    expect(sanitizeFilename('../../evil.png', 'image/png')).toBe('evil.png');
    expect(sanitizeFilename('!!!', 'image/png')).toBe('---');
    expect(sanitizeFilename('', 'image/png')).toMatch(/^[\da-z]+\.png$/i);
  });
});

describe('uploadAvatar', () => {
  it('validates mime type before checking storage configuration', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'avatar-upload-'));
    const filepath = path.join(directory, 'avatar.png');
    await writeFile(filepath, Buffer.from('not-an-image', 'utf8'));

    await expect(
      uploadAvatar({
        file: {
          filepath,
          mimetype: 'image/png',
          originalFilename: 'avatar.png',
          size: 12,
        },
        storageProviderConfig: undefined,
        objectKeyPrefix: 'tenant/user',
        logError: noopLogError,
      })
    ).rejects.toMatchObject({
      code: 'guard.mime_type_not_allowed',
    });
  });

  it('rejects appended payloads after a valid png header', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'avatar-upload-'));
    const filepath = path.join(directory, 'avatar.png');
    await writeFile(filepath, Buffer.concat([validPng, Buffer.from('extra', 'utf8')]));

    await expect(
      uploadAvatar({
        file: {
          filepath,
          mimetype: 'image/png',
          originalFilename: 'avatar.png',
          size: validPng.length + 5,
        },
        storageProviderConfig: undefined,
        objectKeyPrefix: 'tenant/user',
        logError: noopLogError,
      })
    ).rejects.toMatchObject({
      code: 'guard.mime_type_not_allowed',
    });
  });

  it('rejects oversize files before reading content', async () => {
    const directory = await mkdtemp(path.join(tmpdir(), 'avatar-upload-'));
    const filepath = path.join(directory, 'avatar.png');
    await writeFile(filepath, validPng);

    await expect(
      uploadAvatar({
        file: {
          filepath,
          mimetype: 'image/png',
          originalFilename: 'avatar.png',
          size: maxUploadFileSize + 1,
        },
        storageProviderConfig: undefined,
        objectKeyPrefix: 'tenant/user',
        logError: noopLogError,
      })
    ).rejects.toMatchObject({
      code: 'guard.file_size_exceeded',
    });
  });
});
