import { Readable } from 'node:stream';

import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const stream = Readable.from('foo');
const mockedCreateReadStream = jest.fn(() => stream);
const mockedGetMetadata = jest.fn(async () => [{ contentType: 'text/plain', size: '10' }]);
const mockedExists = jest.fn(async () => [true]);
const mockedFile = jest.fn(() => ({
  createReadStream: mockedCreateReadStream,
  getMetadata: mockedGetMetadata,
  exists: mockedExists,
}));

mockEsm('@google-cloud/storage', () => ({
  Storage: jest.fn(() => ({ bucket: jest.fn(() => ({ file: mockedFile })) })),
}));

const { buildGoogleStorage } = await import('./google-storage.js');

const storage = buildGoogleStorage('projectId', 'keyFilename', 'bucket');

describe('buildGoogleStorage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('downloadFile()', () => {
    it('should download the whole object', async () => {
      await expect(storage.downloadFile('foo.txt')).resolves.toEqual({
        contentLength: 10,
        contentType: 'text/plain',
        readableStreamBody: stream,
      });
      expect(mockedFile).toHaveBeenCalledWith('foo.txt');
      expect(mockedCreateReadStream).toHaveBeenCalledWith();
    });

    it('should download `count` bytes from `offset`', async () => {
      await expect(storage.downloadFile('foo.txt', 2, 3)).resolves.toMatchObject({
        contentLength: 3,
      });
      expect(mockedCreateReadStream).toHaveBeenCalledWith({ start: 2, end: 4 });
    });

    it('should cap the range at the end of the object', async () => {
      await expect(storage.downloadFile('foo.txt', 8, 5)).resolves.toMatchObject({
        contentLength: 2,
      });
      expect(mockedCreateReadStream).toHaveBeenCalledWith({ start: 8, end: 12 });
    });
  });

  describe('isFileExisted()', () => {
    it('should return whether the object exists', async () => {
      await expect(storage.isFileExisted('foo.txt')).resolves.toBe(true);

      mockedExists.mockResolvedValueOnce([false]);
      await expect(storage.isFileExisted('foo.txt')).resolves.toBe(false);
    });
  });

  describe('getFileProperties()', () => {
    it('should return the object size as a number', async () => {
      await expect(storage.getFileProperties('foo.txt')).resolves.toEqual({ contentLength: 10 });
    });
  });
});
