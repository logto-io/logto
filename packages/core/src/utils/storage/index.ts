import type { StorageProviderData } from '@logto/schemas';

import { buildAzureStorage } from './azure-storage.js';
import { buildS3Storage } from './s3-storage.js';
import type { UploadFile } from './types.js';

export const buildUploadFile = (config: StorageProviderData): UploadFile => {
  if (config.provider === 'AzureStorage') {
    const storage = buildAzureStorage(config.connectionString, config.container);

    return storage.uploadFile;
  }

  const storage = buildS3Storage(
    config.endpoint,
    config.bucket,
    config.accessKeyId,
    config.accessSecretKey
  );

  return storage.uploadFile;
};
