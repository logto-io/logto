import { createMockUtils } from '@logto/shared/esm';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const mockedUploadData = jest.fn();
const mockedDownload = jest.fn();
const mockedExists = jest.fn();
const mockedGetProperties = jest.fn();
const mockedGetBlockBlobClient = jest.fn(() => ({
  uploadData: mockedUploadData,
  download: mockedDownload,
  exists: mockedExists,
  getProperties: mockedGetProperties,
}));
const mockedGetContainerClient = jest.fn(() => ({
  getBlockBlobClient: mockedGetBlockBlobClient,
}));

mockEsm('@azure/storage-blob', () => ({
  BlobServiceClient: {
    fromConnectionString: jest.fn(() => ({
      accountName: 'mock-account',
      getContainerClient: mockedGetContainerClient,
    })),
  },
}));

const { buildAzureStorage } = await import('./azure-storage.js');

class PrematureCloseError extends Error {
  code = 'ERR_STREAM_PREMATURE_CLOSE';
  errno = 'ERR_STREAM_PREMATURE_CLOSE';
  type = 'system';
}

class TransientStorageError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly errno = code
  ) {
    super(message);
  }
}

describe('buildAzureStorage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isFileExisted()', () => {
    it('should return the blob exists result', async () => {
      mockedExists.mockResolvedValueOnce(true);
      const { isFileExisted } = buildAzureStorage('connectionString', 'container');

      await expect(isFileExisted('foo.txt')).resolves.toBe(true);
      expect(mockedGetContainerClient).toHaveBeenCalledWith('container');
      expect(mockedGetBlockBlobClient).toHaveBeenCalledWith('foo.txt');
    });

    it('should treat Azure premature close errors as missing blobs', async () => {
      mockedExists.mockRejectedValue(new PrematureCloseError('Premature close'));
      const { isFileExisted } = buildAzureStorage('connectionString', 'container');

      await expect(isFileExisted('foo.txt')).resolves.toBe(false);
      expect(mockedExists).toHaveBeenCalledTimes(3);
    });

    it('should retry Azure premature close errors before returning the blob exists result', async () => {
      mockedExists
        .mockRejectedValueOnce(new PrematureCloseError('Premature close'))
        .mockResolvedValueOnce(true);
      const { isFileExisted } = buildAzureStorage('connectionString', 'container');

      await expect(isFileExisted('foo.txt')).resolves.toBe(true);
      expect(mockedExists).toHaveBeenCalledTimes(2);
    });

    it('should rethrow Azure premature close errors when requested', async () => {
      const error = new PrematureCloseError('Premature close');
      mockedExists.mockRejectedValue(error);
      const { isFileExisted } = buildAzureStorage('connectionString', 'container');

      await expect(isFileExisted('foo.txt', { throwOnTransientError: true })).rejects.toBe(error);
      expect(mockedExists).toHaveBeenCalledTimes(3);
    });

    it('should rethrow other blob exists errors', async () => {
      const error = new Error('Storage service unavailable');
      mockedExists.mockRejectedValueOnce(error);
      const { isFileExisted } = buildAzureStorage('connectionString', 'container');

      await expect(isFileExisted('foo.txt')).rejects.toBe(error);
    });
  });

  describe('downloadFile()', () => {
    it('should retry transient Azure storage download errors', async () => {
      const downloadResponse = { contentLength: 42 };
      mockedDownload
        .mockRejectedValueOnce(new TransientStorageError('Socket reset', 'ECONNRESET'))
        .mockResolvedValueOnce(downloadResponse);
      const { downloadFile } = buildAzureStorage('connectionString', 'container');

      await expect(downloadFile('foo.txt')).resolves.toBe(downloadResponse);
      expect(mockedDownload).toHaveBeenCalledTimes(2);
    });
  });

  describe('getFileProperties()', () => {
    it('should retry transient Azure storage get properties errors', async () => {
      const propertiesResponse = { contentLength: 42 };
      mockedGetProperties
        .mockRejectedValueOnce(new TransientStorageError('Timed out', 'ETIMEDOUT'))
        .mockResolvedValueOnce(propertiesResponse);
      const { getFileProperties } = buildAzureStorage('connectionString', 'container');

      await expect(getFileProperties('foo.txt')).resolves.toBe(propertiesResponse);
      expect(mockedGetProperties).toHaveBeenCalledTimes(2);
    });
  });
});
