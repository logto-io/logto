import { Readable } from 'node:stream';

import {
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3ServiceException,
} from '@aws-sdk/client-s3';
import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const send = jest.fn();

await mockEsmWithActual('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn(() => ({ send })),
}));

const { buildS3Storage } = await import('./s3-storage.js');

const storage = buildS3Storage({
  bucket: 'bucket',
  accessKeyId: 'accessKeyId',
  secretAccessKey: 'secretAccessKey',
  endpoint: 'http://localhost:9000',
  forcePathStyle: true,
});

const buildServiceException = (httpStatusCode: number) =>
  new S3ServiceException({
    name: httpStatusCode === 404 ? 'NotFound' : 'Forbidden',
    $fault: 'client',
    $metadata: { httpStatusCode },
  });

describe('buildS3Storage()', () => {
  afterEach(() => {
    send.mockReset();
  });

  describe('uploadFile()', () => {
    it('should upload a publicly readable object by default', async () => {
      await expect(
        storage.uploadFile(Buffer.from('foo'), 'foo.txt', { contentType: 'text/plain' })
      ).resolves.toEqual({ url: 'http://localhost:9000/bucket/foo.txt' });

      const [command] = send.mock.calls[0] as [PutObjectCommand];
      expect(command).toBeInstanceOf(PutObjectCommand);
      expect(command.input).toMatchObject({
        Bucket: 'bucket',
        Key: 'foo.txt',
        ContentType: 'text/plain',
        ACL: 'public-read',
      });
    });

    it('should not send an ACL for a private object', async () => {
      await storage.uploadFile(Buffer.from('foo'), 'foo.txt', { isPublic: false });

      const [command] = send.mock.calls[0] as [PutObjectCommand];
      expect(command.input.ACL).toBeUndefined();
    });
  });

  describe('downloadFile()', () => {
    it('should download the whole object', async () => {
      const body = Readable.from('foo');
      send.mockResolvedValueOnce({ Body: body, ContentLength: 3, ContentType: 'text/plain' });

      await expect(storage.downloadFile('foo.txt')).resolves.toEqual({
        contentLength: 3,
        contentType: 'text/plain',
        readableStreamBody: body,
      });

      const [command] = send.mock.calls[0] as [GetObjectCommand];
      expect(command).toBeInstanceOf(GetObjectCommand);
      expect(command.input).toEqual({ Bucket: 'bucket', Key: 'foo.txt', Range: undefined });
    });

    it('should download `count` bytes from `offset`', async () => {
      send.mockResolvedValueOnce({ Body: Readable.from('o'), ContentLength: 1 });

      await storage.downloadFile('foo.txt', 1, 1);

      const [command] = send.mock.calls[0] as [GetObjectCommand];
      expect(command.input.Range).toBe('bytes=1-1');
    });

    it('should download to the end of the object without `count`', async () => {
      send.mockResolvedValueOnce({ Body: Readable.from('oo'), ContentLength: 2 });

      await storage.downloadFile('foo.txt', 1);

      const [command] = send.mock.calls[0] as [GetObjectCommand];
      expect(command.input.Range).toBe('bytes=1-');
    });
  });

  describe('isFileExisted()', () => {
    it('should return true when the object exists', async () => {
      send.mockResolvedValueOnce({});

      await expect(storage.isFileExisted('foo.txt')).resolves.toBe(true);

      const [command] = send.mock.calls[0] as [HeadObjectCommand];
      expect(command).toBeInstanceOf(HeadObjectCommand);
      expect(command.input).toEqual({ Bucket: 'bucket', Key: 'foo.txt' });
    });

    it('should return false when the object is missing', async () => {
      send.mockRejectedValueOnce(buildServiceException(404));

      await expect(storage.isFileExisted('foo.txt')).resolves.toBe(false);
    });

    it('should rethrow any other error', async () => {
      const error = buildServiceException(403);
      send.mockRejectedValueOnce(error);

      await expect(storage.isFileExisted('foo.txt')).rejects.toBe(error);
    });
  });

  describe('getFileProperties()', () => {
    it('should return the object size', async () => {
      send.mockResolvedValueOnce({ ContentLength: 42 });

      await expect(storage.getFileProperties('foo.txt')).resolves.toEqual({ contentLength: 42 });
    });
  });
});
