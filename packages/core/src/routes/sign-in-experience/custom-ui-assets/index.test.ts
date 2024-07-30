import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { StorageProvider } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import AdmZip from 'adm-zip';
import pRetry from 'p-retry';
import { type Response } from 'supertest';

import SystemContext from '#src/tenants/SystemContext.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const experienceZipsProviderConfig = {
  provider: StorageProvider.AzureStorage,
  connectionString: 'connectionString',
  container: 'container',
} satisfies {
  provider: StorageProvider.AzureStorage;
  connectionString: string;
  container: string;
};

// eslint-disable-next-line @silverhand/fp/no-mutation
SystemContext.shared.experienceZipsProviderConfig = experienceZipsProviderConfig;

const mockedIsFileExisted = jest.fn(async (filename: string) => false);
const mockedDownloadFile = jest.fn();

await mockEsmWithActual('#src/utils/storage/azure-storage.js', () => ({
  buildAzureStorage: () => ({
    uploadFile: jest.fn(async () => 'https://fake.url'),
    downloadFile: mockedDownloadFile,
    isFileExisted: mockedIsFileExisted,
  }),
}));

await mockEsmWithActual('#src/utils/tenant.js', () => ({
  getTenantId: jest.fn().mockResolvedValue(['default']),
}));

await mockEsmWithActual('p-retry', () => ({
  // Stub pRetry by overriding the default "exponential backoff",
  // in order to make the test run faster.
  default: async (input: <T>(retries: number) => T | PromiseLike<T>) =>
    pRetry(input, { factor: 0 }),
}));

const mockedGenerateStandardId = jest.fn(generateStandardId);

await mockEsmWithActual('@logto/shared', () => ({
  generateStandardId: mockedGenerateStandardId,
}));

const tenantContext = new MockTenant();

const signInExperiencesRoutes = await pickDefault(import('./index.js'));
const signInExperienceRequester = createRequester({
  authedRoutes: signInExperiencesRoutes,
  tenantContext,
});

const currentPath = path.dirname(fileURLToPath(import.meta.url));
const testFilesPath = path.join(currentPath, 'test-files');
const pathToZip = path.join(testFilesPath, 'assets.zip');

const uploadCustomUiAssets = async (filePath: string): Promise<Response> => {
  const response = await signInExperienceRequester
    .post('/sign-in-exp/default/custom-ui-assets')
    .field('name', 'file')
    .attach('file', filePath);

  return response;
};

describe('POST /sign-in-exp/default/custom-ui-assets', () => {
  beforeAll(async () => {
    await fs.mkdir(testFilesPath);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    void fs.rm(testFilesPath, { force: true, recursive: true });
  });

  it('should fail if upload file is not a zip', async () => {
    const pathToTxt = path.join(testFilesPath, 'foo.txt');
    await fs.writeFile(pathToTxt, 'foo');
    const response = await uploadCustomUiAssets(pathToTxt);

    expect(response.status).toBe(400);
  });

  it('should upload custom ui assets', async () => {
    mockedGenerateStandardId.mockReturnValue('custom-ui-asset-id');
    const zip = new AdmZip();
    zip.addFile('index.html', Buffer.from('<html></html>'));
    await zip.writeZipPromise(pathToZip);
    const response = await uploadCustomUiAssets(pathToZip);

    expect(response.status).toBe(200);
    expect(response.body.customUiAssetId).toBe('custom-ui-asset-id');
  });

  it('should fail if the error.log file exists', async () => {
    mockedIsFileExisted.mockImplementation(async (filename: string) =>
      filename.endsWith('error.log')
    );
    mockedDownloadFile.mockImplementation(async () => ({
      readableStreamBody: Readable.from('Failed to unzip files!'),
    }));
    const response = await uploadCustomUiAssets(pathToZip);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Failed to upload file to the storage provider.');
  });

  it('should fail if the upload zip always persists (unzipping azure function does not trigger)', async () => {
    mockedIsFileExisted.mockImplementation(async (filename) => filename.endsWith('assets.zip'));
    const response = await uploadCustomUiAssets(pathToZip);
    expect(response.status).toBe(500);
    expect(response.text).toBe('Failed to upload file to the storage provider.');
    expect(mockedIsFileExisted).toHaveBeenCalledTimes(10);
  });
});
