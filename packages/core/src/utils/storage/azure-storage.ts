import { BlobServiceClient } from '@azure/storage-blob';

import type { UploadFile } from './types.js';

const defaultPublicDomain = 'blob.core.windows.net';

export const buildAzureStorage = (connectionString: string, container: string) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(container);

  const uploadFile: UploadFile = async (data, objectKey, { contentType, publicUrl } = {}) => {
    const blockBlobClient = containerClient.getBlockBlobClient(objectKey);

    await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: contentType ? { blobContentType: contentType } : undefined,
    });

    if (publicUrl) {
      return { url: `${publicUrl}/${objectKey}` };
    }

    return {
      url: `https://${blobServiceClient.accountName}.${defaultPublicDomain}/${container}/${objectKey}`,
    };
  };

  return { uploadFile };
};
