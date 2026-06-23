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
      mockedExists.mockRejectedValueOnce(
        new PrematureCloseError(
          'Invalid response body while trying to fetch https://example.com/foo.txt: Premature close'
        )
      );
      const { isFileExisted } = buildAzureStorage('connectionString', 'container');

      await expect(isFileExisted('foo.txt')).resolves.toBe(false);
    });

    it('should rethrow other blob exists errors', async () => {
      const error = new Error('Storage service unavailable');
      mockedExists.mockRejectedValueOnce(error);
      const { isFileExisted } = buildAzureStorage('connectionString', 'container');

      await expect(isFileExisted('foo.txt')).rejects.toBe(error);
    });
  });
});
