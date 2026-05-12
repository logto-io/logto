import { Readable } from 'node:stream';

import { detectImageType, streamToString } from './file.js';

describe('streamToString()', () => {
  it('should return an empty string if the stream is empty', async () => {
    const result = await streamToString();
    expect(result).toBe('');
  });

  it('should return the stream content as a string', async () => {
    const stream = Readable.from(['Hello', ' ', 'world', '!']);
    const result = await streamToString(stream);
    expect(result).toBe('Hello world!');
  });
});

describe('detectImageType()', () => {
  it('should detect JPEG from magic bytes', () => {
    const buffer = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const result = detectImageType(buffer);
    expect(result).toEqual({ mime: 'image/jpeg', extension: 'jpg' });
  });

  it('should detect PNG from magic bytes', () => {
    const buffer = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const result = detectImageType(buffer);
    expect(result).toEqual({ mime: 'image/png', extension: 'png' });
  });

  it('should detect GIF from magic bytes', () => {
    const buffer = new Uint8Array([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);
    const result = detectImageType(buffer);
    expect(result).toEqual({ mime: 'image/gif', extension: 'gif' });
  });

  it('should detect BMP from magic bytes', () => {
    const buffer = new Uint8Array([0x42, 0x4d, 0x00, 0x00]);
    const result = detectImageType(buffer);
    expect(result).toEqual({ mime: 'image/bmp', extension: 'bmp' });
  });

  it('should detect WebP from RIFF header with WEBP at offset 8', () => {
    // RIFF header (R,I,F,F) + file size 4 bytes + WEBP at offset 8
    const buffer = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50,
    ]);
    const result = detectImageType(buffer);
    expect(result).toEqual({ mime: 'image/webp', extension: 'webp' });
  });

  it('should return undefined for a non-image buffer', () => {
    const buffer = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const result = detectImageType(buffer);
    expect(result).toBeUndefined();
  });

  it('should return undefined for a buffer shorter than any magic byte signature', () => {
    const buffer = new Uint8Array([0xff]); // Only one byte, not enough for JPEG (needs 3)
    const result = detectImageType(buffer);
    expect(result).toBeUndefined();
  });

  it('should return undefined for a buffer that matches RIFF but not WEBP', () => {
    const buffer = new Uint8Array([
      0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x41, 0x56, 0x49, 0x20,
    ]); // RIFF + 'AVI '
    const result = detectImageType(buffer);
    expect(result).toBeUndefined();
  });
});
