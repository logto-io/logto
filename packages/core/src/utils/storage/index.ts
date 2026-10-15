import type { StorageProviderData } from '@logto/schemas';

import { buildAzureStorage } from './azure-storage.js';
import { buildGoogleStorage } from './google-storage.js';
import { buildS3Storage } from './s3-storage.js';
import type { Storage, UploadFile } from './types.js';

/** Build the storage client of a configured provider. */
export const buildStorage = (config: StorageProviderData): Storage => {
  if (config.provider === 'AzureStorage') {
    return buildAzureStorage(config.connectionString, config.container);
  }

  if (config.provider === 'GoogleStorage') {
    const { projectId, keyFilename, bucketName } = config;

    return buildGoogleStorage(projectId, keyFilename, bucketName);
  }

  const { endpoint, bucket, accessKeyId, forcePathStyle, accessSecretKey, region } = config;

  return buildS3Storage({
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey: accessSecretKey,
    region,
    forcePathStyle,
  });
};

// eslint-disable-next-line @typescript-eslint/ban-types -- Google doesn't allow us to use Uint8Array
export const buildUploadFile = (config: StorageProviderData): UploadFile | UploadFile<Buffer> =>
  buildStorage(config).uploadFile;
