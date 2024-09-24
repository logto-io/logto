import { Readable } from 'node:stream';

import { StorageProvider } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import RequestError from '#src/errors/RequestError/index.js';
import SystemContext from '#src/tenants/SystemContext.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const experienceBlobsProviderConfig = {
  provider: StorageProvider.AzureStorage,
  connectionString: 'connectionString',
  container: 'container',
} satisfies {
  provider: StorageProvider.AzureStorage;
  connectionString: string;
  container: string;
};

// eslint-disable-next-line @silverhand/fp/no-mutation
SystemContext.shared.experienceBlobsProviderConfig = experienceBlobsProviderConfig;

const mockedIsFileExisted = jest.fn(async (filename: string) => true);
const mockedDownloadFile = jest.fn();
const mockedGetFileProperties = jest.fn(async () => ({ contentLength: 100 }));

await mockEsmWithActual('#src/utils/storage/azure-storage.js', () => ({
  buildAzureStorage: jest.fn(() => ({
    uploadFile: jest.fn(async () => 'https://fake.url'),
    downloadFile: mockedDownloadFile,
    isFileExisted: mockedIsFileExisted,
    getFileProperties: mockedGetFileProperties,
  })),
}));

await mockEsmWithActual('#src/utils/tenant.js', () => ({
  getTenantId: jest.fn().mockResolvedValue(['default']),
}));

const koaServeCustomUiAssets = await pickDefault(import('./koa-serve-custom-ui-assets.js'));

describe('koaServeCustomUiAssets middleware', () => {
  const next = jest.fn();

  it('should serve the file directly if the request path contains a dot', async () => {
    const mockBodyStream = Readable.from('javascript content');
    mockedDownloadFile.mockImplementation(async (objectKey: string) => {
      if (objectKey.endsWith('/scripts.js')) {
        return {
          contentType: 'text/javascript',
          readableStreamBody: mockBodyStream,
        };
      }
      throw new Error('File not found');
    });
    const ctx = createMockContext({ url: '/scripts.js' });

    await koaServeCustomUiAssets('custom-ui-asset-id')(ctx, next);

    expect(ctx.type).toEqual('text/javascript');
    expect(ctx.body).toEqual(mockBodyStream);
  });

  it('should serve the index.html', async () => {
    const mockBodyStream = Readable.from('<html></html>');
    mockedDownloadFile.mockImplementation(async (objectKey: string) => {
      if (objectKey.endsWith('/index.html')) {
        return {
          contentType: 'text/html',
          readableStreamBody: mockBodyStream,
        };
      }
      throw new Error('File not found');
    });
    const ctx = createMockContext({ url: '/sign-in' });
    await koaServeCustomUiAssets('custom-ui-asset-id')(ctx, next);

    expect(ctx.type).toEqual('text/html');
    expect(ctx.body).toEqual(mockBodyStream);
  });

  it('should return 404 if the file does not exist', async () => {
    mockedIsFileExisted.mockResolvedValueOnce(false);
    const ctx = createMockContext({ url: '/fake.txt' });

    await expect(koaServeCustomUiAssets('custom-ui-asset-id')(ctx, next)).rejects.toMatchError(
      new RequestError({ code: 'entity.not_found', status: 404 })
    );
  });

  it('should be able to handle range request', async () => {
    const mockBodyStream = Readable.from('video data');
    mockedDownloadFile.mockImplementationOnce(
      async (objectKey: string, offset?: number, count?: number) => {
        if (objectKey.endsWith('/video.mp4')) {
          return {
            contentType: 'video/mp4',
            readableStreamBody: mockBodyStream,
            contentLength: count ?? 0,
          };
        }
        throw new Error('File not found');
      }
    );

    const ctx = createMockContext({ url: '/video.mp4', headers: { range: 'bytes=0-10' } });

    await koaServeCustomUiAssets('custom-ui-asset-id')(ctx, next);

    expect(mockedDownloadFile).toHaveBeenCalledWith('default/custom-ui-asset-id/video.mp4', 0, 11);
    expect(ctx.type).toEqual('video/mp4');
    expect(ctx.body).toEqual(mockBodyStream);
    expect(ctx.status).toEqual(206);
    expect(ctx.response.headers['accept-ranges']).toEqual('bytes');
    expect(ctx.response.headers['content-range']).toEqual('bytes 0-10/100');
    expect(ctx.response.headers['content-length']).toEqual('11');
  });

  it('should throw if range is not satisfiable', async () => {
    const ctx = createMockContext({ url: '/video.mp4', headers: { range: 'invalid-range' } });

    await expect(koaServeCustomUiAssets('custom-ui-asset-id')(ctx, next)).rejects.toMatchError(
      new RequestError({ code: 'request.range_not_satisfiable', status: 416 })
    );
  });
});
