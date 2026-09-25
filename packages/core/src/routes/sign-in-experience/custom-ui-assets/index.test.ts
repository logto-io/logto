import fs from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'node:url';

import { StorageProvider, ossDefaultQuota } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import AdmZip from 'adm-zip';
import pRetry from 'p-retry';
import { type Response } from 'supertest';

import { EnvSet } from '#src/env-set/index.js';
import SystemContext from '#src/tenants/SystemContext.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

// eslint-disable-next-line @silverhand/fp/no-mutation
SystemContext.shared.experienceZipsProviderConfig = {
  provider: StorageProvider.AzureStorage,
  connectionString: 'connectionString',
  container: 'zips',
};
// eslint-disable-next-line @silverhand/fp/no-mutation
SystemContext.shared.experienceBlobsProviderConfig = {
  provider: StorageProvider.S3Storage,
  endpoint: 'http://localhost:9000',
  bucket: 'blobs',
  accessKeyId: 'accessKeyId',
  accessSecretKey: 'accessSecretKey',
};

const mockedIsFileExisted = jest.fn(async (filename: string) => false);
const mockedDownloadFile = jest.fn();
const mockedAzureUploadFile = jest.fn(async () => ({ url: 'https://fake.url' }));

await mockEsmWithActual('#src/utils/storage/azure-storage.js', () => ({
  buildAzureStorage: () => ({
    uploadFile: mockedAzureUploadFile,
    downloadFile: mockedDownloadFile,
    isFileExisted: mockedIsFileExisted,
  }),
}));

const mockedS3UploadFile = jest.fn(async () => ({ url: 'https://fake.url' }));

await mockEsmWithActual('#src/utils/storage/s3-storage.js', () => ({
  buildS3Storage: () => ({ uploadFile: mockedS3UploadFile }),
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

const mockedReadLicense = jest.fn();

await mockEsmWithActual('#src/license/LicenseReader.js', () => ({
  default: { shared: { read: mockedReadLicense } },
}));

const withLicense = (bringYourUi: boolean) => {
  mockedReadLicense.mockResolvedValue({ quota: { ...ossDefaultQuota, bringYourUi } });
};

// The Cloud quota guard is covered by its own tests; here it only has to let the request through.
const tenantContext = new MockTenant(undefined, undefined, undefined, {
  quota: { guardTenantUsageByKey: jest.fn() },
});

const signInExperiencesRoutes = await pickDefault(import('./index.js'));

/** The routes read the environment when they are built, so build them per environment. */
const createSignInExperienceRequester = () =>
  createRequester({ authedRoutes: signInExperiencesRoutes, tenantContext });

const currentPath = path.dirname(fileURLToPath(import.meta.url));
const testFilesPath = path.join(currentPath, 'test-files');
const pathToZip = path.join(testFilesPath, 'assets.zip');

const setEnv = (values: { isCloud: boolean; isDevFeaturesEnabled?: boolean }) => {
  for (const [key, value] of Object.entries(values)) {
    Reflect.set(EnvSet.values, key, value);
  }
};

describe('POST /sign-in-exp/default/custom-ui-assets', () => {
  const { isCloud, isDevFeaturesEnabled } = EnvSet.values;

  beforeAll(async () => {
    await fs.mkdir(testFilesPath);
    const zip = new AdmZip();
    zip.addFile('index.html', Buffer.from('<html></html>'));
    await zip.writeZipPromise(pathToZip);
  });

  afterEach(() => {
    jest.clearAllMocks();
    setEnv({ isCloud, isDevFeaturesEnabled });
  });

  afterAll(async () => {
    void fs.rm(testFilesPath, { force: true, recursive: true });
  });

  describe('on Cloud', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let upload: (filePath: string) => Promise<Response>;

    beforeAll(() => {
      setEnv({ isCloud: true });
      const requester = createSignInExperienceRequester();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      upload = async (filePath) =>
        requester
          .post('/sign-in-exp/default/custom-ui-assets')
          .field('name', 'file')
          .attach('file', filePath);
    });

    beforeEach(() => {
      setEnv({ isCloud: true });
    });

    it('should fail if upload file is not a zip', async () => {
      const pathToTxt = path.join(testFilesPath, 'foo.txt');
      await fs.writeFile(pathToTxt, 'foo');
      const response = await upload(pathToTxt);

      expect(response.status).toBe(400);
    });

    it('should upload the zip for the Azure function to unzip', async () => {
      mockedGenerateStandardId.mockReturnValueOnce('custom-ui-asset-id');
      const response = await upload(pathToZip);

      expect(response.status).toBe(200);
      expect(response.body.customUiAssetId).toBe('custom-ui-asset-id');
      expect(mockedAzureUploadFile).toHaveBeenCalledWith(
        expect.any(Buffer),
        'default/custom-ui-asset-id/assets.zip',
        { contentType: 'application/zip' }
      );
      expect(mockedS3UploadFile).not.toHaveBeenCalled();
      expect(mockedReadLicense).not.toHaveBeenCalled();
    });

    it('should fail if the error.log file exists', async () => {
      mockedIsFileExisted.mockImplementation(async (filename: string) =>
        filename.endsWith('error.log')
      );
      mockedDownloadFile.mockImplementation(async () => ({
        readableStreamBody: Readable.from('Failed to unzip files!'),
      }));
      const response = await upload(pathToZip);
      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to upload file to the storage provider.');
    });

    it('should fail if the upload zip always persists (unzipping azure function does not trigger)', async () => {
      mockedIsFileExisted.mockImplementation(async (filename) => filename.endsWith('assets.zip'));
      const response = await upload(pathToZip);
      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to upload file to the storage provider.');
      expect(mockedIsFileExisted).toHaveBeenCalledTimes(12);
    });

    it('should succeed if the upload zip is removed on the final retry', async () => {
      // eslint-disable-next-line @silverhand/fp/no-let
      let assetsZipChecks = 0;
      mockedIsFileExisted.mockImplementation(async (filename) => {
        if (filename.endsWith('assets.zip')) {
          // eslint-disable-next-line @silverhand/fp/no-mutation
          assetsZipChecks += 1;
          return assetsZipChecks < 6;
        }

        return false;
      });
      const response = await upload(pathToZip);
      expect(response.status).toBe(200);
      expect(mockedIsFileExisted).toHaveBeenCalledTimes(12);
    });
  });

  describe('on a self-hosted deployment', () => {
    // eslint-disable-next-line @silverhand/fp/no-let
    let upload: (filePath: string) => Promise<Response>;

    beforeAll(() => {
      setEnv({ isCloud: false, isDevFeaturesEnabled: true });
      const requester = createSignInExperienceRequester();
      // eslint-disable-next-line @silverhand/fp/no-mutation
      upload = async (filePath) =>
        requester
          .post('/sign-in-exp/default/custom-ui-assets')
          .field('name', 'file')
          .attach('file', filePath);
    });

    beforeEach(() => {
      setEnv({ isCloud: false, isDevFeaturesEnabled: true });
    });

    it('should reject the upload without a license', async () => {
      mockedReadLicense.mockResolvedValueOnce(null);
      const response = await upload(pathToZip);

      expect(response.status).toBe(403);
      expect(mockedS3UploadFile).not.toHaveBeenCalled();
    });

    it('should reject the upload with a license that does not grant Bring your UI', async () => {
      withLicense(false);
      const response = await upload(pathToZip);

      expect(response.status).toBe(403);
      expect(mockedS3UploadFile).not.toHaveBeenCalled();
    });

    it('should unzip the assets into the blobs storage', async () => {
      withLicense(true);
      mockedGenerateStandardId.mockReturnValueOnce('custom-ui-asset-id');
      const response = await upload(pathToZip);

      expect(response.status).toBe(200);
      expect(response.body.customUiAssetId).toBe('custom-ui-asset-id');
      expect(mockedS3UploadFile).toHaveBeenCalledWith(
        Buffer.from('<html></html>'),
        'default/custom-ui-asset-id/index.html',
        { contentType: 'text/html', isPublic: false }
      );
      expect(mockedAzureUploadFile).not.toHaveBeenCalled();
    });

    it('should fail when the zip cannot be unzipped', async () => {
      withLicense(true);
      const pathToEmptyZip = path.join(testFilesPath, 'empty.zip');
      await new AdmZip().writeZipPromise(pathToEmptyZip);
      const response = await upload(pathToEmptyZip);

      expect(response.status).toBe(500);
      expect(response.text).toBe('Failed to upload file to the storage provider.');
      expect(mockedS3UploadFile).not.toHaveBeenCalled();
    });

    it('should fail when the blobs storage is not configured', async () => {
      withLicense(true);
      const { experienceBlobsProviderConfig } = SystemContext.shared;
      // eslint-disable-next-line @silverhand/fp/no-mutation
      SystemContext.shared.experienceBlobsProviderConfig = undefined;

      const response = await upload(pathToZip);

      // eslint-disable-next-line @silverhand/fp/no-mutation
      SystemContext.shared.experienceBlobsProviderConfig = experienceBlobsProviderConfig;
      expect(response.status).toBe(400);
      expect(response.text).toBe('Storage provider is not configured.');
    });
  });
});
