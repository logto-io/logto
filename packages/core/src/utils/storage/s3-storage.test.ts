import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;

const mockS3Send = jest.fn();

const { mockEsmWithActual } = createMockUtils(jest);

const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  CopyObjectCommand,
} = await mockEsmWithActual('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: mockS3Send,
  })),
  PutObjectCommand: jest.fn(),
  DeleteObjectCommand: jest.fn(),
  HeadObjectCommand: jest.fn(),
  ListObjectsV2Command: jest.fn(),
  GetObjectCommand: jest.fn(),
  CopyObjectCommand: jest.fn(),
}));

const { buildS3Storage } = await import('./s3-storage.js');

describe('buildS3Storage', () => {
  const bucket = 'test-bucket';
  const region = 'us-east-1';
  const accessKeyId = 'test-access-key';
  const secretAccessKey = 'test-secret-key';

  const storage = buildS3Storage({
    bucket,
    region,
    accessKeyId,
    secretAccessKey,
    endpoint: 'https://s3.us-east-1.amazonaws.com',
  });

  beforeEach(() => {
    mockS3Send.mockReset();
  });

  describe('deleteFile', () => {
    it('deletes a file successfully', async () => {
      mockS3Send.mockResolvedValue({});

      await storage.deleteFile('my-file.txt');

      expect(mockS3Send).toHaveBeenCalledTimes(1);
      const command = mockS3Send.mock.calls[0][0];
      expect(command).toBeInstanceOf(DeleteObjectCommand);
      expect(command.input.Bucket).toBe(bucket);
      expect(command.input.Key).toBe('my-file.txt');
    });

    it('swallows NotFound errors', async () => {
      const notFoundError = new Error('Not Found');
      notFoundError.name = 'NotFound';
      mockS3Send.mockRejectedValue(notFoundError);

      await expect(storage.deleteFile('nonexistent.txt')).resolves.toBeUndefined();
    });

    it('re-throws other errors', async () => {
      const accessDeniedError = new Error('Access Denied');
      mockS3Send.mockRejectedValue(accessDeniedError);

      await expect(storage.deleteFile('protected.txt')).rejects.toThrow('Access Denied');
    });
  });

  describe('isFileExisted', () => {
    it('returns true when file exists', async () => {
      mockS3Send.mockResolvedValue({ ContentType: 'text/plain' });

      const result = await storage.isFileExisted('my-file.txt');

      expect(result).toBe(true);
      const command = mockS3Send.mock.calls[0][0];
      expect(command).toBeInstanceOf(HeadObjectCommand);
      expect(command.input.Bucket).toBe(bucket);
      expect(command.input.Key).toBe('my-file.txt');
    });

    it('returns false when file is not found', async () => {
      const notFoundError = new Error('Not Found');
      notFoundError.name = 'NotFound';
      mockS3Send.mockRejectedValue(notFoundError);

      const result = await storage.isFileExisted('nonexistent.txt');

      expect(result).toBe(false);
    });

    it('re-throws other errors', async () => {
      const serverError = new Error('Internal Server Error');
      mockS3Send.mockRejectedValue(serverError);

      await expect(storage.isFileExisted('any-file.txt')).rejects.toThrow('Internal Server Error');
    });
  });

  describe('listFiles', () => {
    it('returns array of keys when files exist', async () => {
      mockS3Send.mockResolvedValue({
        Contents: [{ Key: 'prefix/file1.txt' }, { Key: 'prefix/file2.txt' }],
      });

      const result = await storage.listFiles('prefix/');

      expect(result).toEqual(['prefix/file1.txt', 'prefix/file2.txt']);
      const command = mockS3Send.mock.calls[0][0];
      expect(command).toBeInstanceOf(ListObjectsV2Command);
      expect(command.input.Bucket).toBe(bucket);
      expect(command.input.Prefix).toBe('prefix/');
    });

    it('returns empty array when no files found', async () => {
      mockS3Send.mockResolvedValue({});

      const result = await storage.listFiles('empty-prefix/');

      expect(result).toEqual([]);
    });

    it('paginates when there are more results', async () => {
      mockS3Send
        .mockResolvedValueOnce({
          Contents: [{ Key: 'prefix/file1.txt' }, { Key: 'prefix/file2.txt' }],
          IsTruncated: true,
          NextContinuationToken: 'token1',
        })
        .mockResolvedValueOnce({
          Contents: [{ Key: 'prefix/file3.txt' }],
          IsTruncated: false,
        });

      const result = await storage.listFiles('prefix/');

      expect(result).toEqual(['prefix/file1.txt', 'prefix/file2.txt', 'prefix/file3.txt']);
      expect(mockS3Send).toHaveBeenCalledTimes(2);

      // First call: no ContinuationToken
      const firstCommand = mockS3Send.mock.calls[0][0];
      expect(firstCommand.input.ContinuationToken).toBeUndefined();

      // Second call: should include ContinuationToken
      const secondCommand = mockS3Send.mock.calls[1][0];
      expect(secondCommand.input.ContinuationToken).toBe('token1');
    });

    it('handles empty Contents in paginated response', async () => {
      mockS3Send
        .mockResolvedValueOnce({
          Contents: [{ Key: 'prefix/file1.txt' }],
          IsTruncated: true,
          NextContinuationToken: 'token1',
        })
        .mockResolvedValueOnce({
          IsTruncated: false,
        });

      const result = await storage.listFiles('prefix/');

      expect(result).toEqual(['prefix/file1.txt']);
      expect(mockS3Send).toHaveBeenCalledTimes(2);
    });

    it('filters out items with undefined Key', async () => {
      mockS3Send.mockResolvedValue({
        Contents: [{ Key: 'prefix/file1.txt' }, { Key: undefined }, { Key: 'prefix/file2.txt' }],
      });

      const result = await storage.listFiles('prefix/');

      expect(result).toEqual(['prefix/file1.txt', 'prefix/file2.txt']);
    });
  });

  describe('downloadFile', () => {
    it('downloads a file and returns body with metadata', async () => {
      const mockBody = {} as ReadableStream;
      const mockTransformToWebStream = jest.fn().mockReturnValue(mockBody);

      mockS3Send.mockResolvedValue({
        Body: { transformToWebStream: mockTransformToWebStream },
        ContentType: 'application/json',
        ContentLength: 1234,
      });

      const result = await storage.downloadFile('my-file.json');

      expect(result.body).toBe(mockBody);
      expect(result.contentType).toBe('application/json');
      expect(result.contentLength).toBe(1234);
      const command = mockS3Send.mock.calls[0][0];
      expect(command).toBeInstanceOf(GetObjectCommand);
      expect(command.input.Bucket).toBe(bucket);
      expect(command.input.Key).toBe('my-file.json');
    });

    it('returns undefined contentType and contentLength when not provided', async () => {
      const mockBody = {} as ReadableStream;
      const mockTransformToWebStream = jest.fn().mockReturnValue(mockBody);

      mockS3Send.mockResolvedValue({
        Body: { transformToWebStream: mockTransformToWebStream },
      });

      const result = await storage.downloadFile('binary-file.bin');

      expect(result.body).toBe(mockBody);
      expect(result.contentType).toBeUndefined();
      expect(result.contentLength).toBeUndefined();
    });
  });

  describe('copyFile', () => {
    it('copies a file from source to destination with public-read ACL', async () => {
      mockS3Send.mockResolvedValue({});

      await storage.copyFile('source/file.txt', 'dest/file.txt');

      expect(mockS3Send).toHaveBeenCalledTimes(1);
      const command = mockS3Send.mock.calls[0][0];
      expect(command).toBeInstanceOf(CopyObjectCommand);
      expect(command.input.Bucket).toBe(bucket);
      expect(command.input.CopySource).toBe(`${bucket}/source/file.txt`);
      expect(command.input.Key).toBe('dest/file.txt');
      expect(command.input.ACL).toBe('public-read');
    });
  });
});
