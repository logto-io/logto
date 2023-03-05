import type { StorageProviderData } from '@logto/schemas';

import { buildAzureStorage } from './azure-storage.js';

export const buildUploadFile = (config: StorageProviderData) => {
  if (config.provider === 'AzureStorage') {
    const storage = buildAzureStorage(config.connectionString, config.container);

    return storage.uploadFile;
  }

  throw new Error('provider not supported');
};
