import type { StorageProviderData } from '@logto/schemas';

import { buildAzureStorage } from './azure-storage.js';
import { buildGoogleStorage } from './google-storage.js';
import { buildS3Storage } from './s3-storage.js';
import type { UploadFile } from './types.js';

export const buildUploadFile = (config: StorageProviderData): UploadFile => {
  if (config.provider === 'AzureStorage') {
    const storage = buildAzureStorage(config.connectionString, config.container);

    return storage.uploadFile;
  }
  if (config.provider === 'GoogleStorage') {
    const { projectId, keyFilename, bucketName } = config;
    const storage = buildGoogleStorage(projectId, keyFilename, bucketName);

    return storage.uploadFile;
  }

  const { endpoint, bucket, accessKeyId, accessSecretKey, region } = config;

  const storage = buildS3Storage({
    endpoint,
    bucket,
    accessKeyId,
    secretAccessKey: accessSecretKey,
    region,
  });

  return storage.uploadFile;
};
