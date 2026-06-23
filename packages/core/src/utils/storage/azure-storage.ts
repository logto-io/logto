import {
  type BlobDownloadOptions,
  type BlobDownloadResponseParsed,
  type BlobGetPropertiesResponse,
  BlobServiceClient,
} from '@azure/storage-blob';

import type { UploadFile } from './types.js';

const defaultPublicDomain = 'blob.core.windows.net';

const getErrorProperty = (error: unknown, property: string) => {
  if (typeof error !== 'object' || error === null || !(property in error)) {
    return;
  }

  const value: unknown = Reflect.get(error, property);

  return typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;
};

const isPrematureCloseStorageError = (error: unknown) =>
  getErrorProperty(error, 'code') === 'ERR_STREAM_PREMATURE_CLOSE' ||
  getErrorProperty(error, 'errno') === 'ERR_STREAM_PREMATURE_CLOSE';

export const buildAzureStorage = (
  connectionString: string,
  container: string
): {
  uploadFile: UploadFile;
  downloadFile: (
    objectKey: string,
    offset?: number,
    count?: number,
    options?: BlobDownloadOptions
  ) => Promise<BlobDownloadResponseParsed>;
  isFileExisted: (objectKey: string) => Promise<boolean>;
  getFileProperties: (objectKey: string) => Promise<BlobGetPropertiesResponse>;
} => {
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

  const downloadFile = async (
    objectKey: string,
    offset?: number,
    count?: number,
    options?: BlobDownloadOptions
  ) => {
    const blockBlobClient = containerClient.getBlockBlobClient(objectKey);
    return blockBlobClient.download(offset, count, options);
  };

  const isFileExisted = async (objectKey: string) => {
    const blockBlobClient = containerClient.getBlockBlobClient(objectKey);
    try {
      return await blockBlobClient.exists();
    } catch (error: unknown) {
      // Azure Blob `exists()` may throw this when the blob is missing in some runtime/proxy paths.
      if (isPrematureCloseStorageError(error)) {
        return false;
      }

      throw error;
    }
  };

  const getFileProperties = async (objectKey: string) => {
    const blockBlobClient = containerClient.getBlockBlobClient(objectKey);
    return blockBlobClient.getProperties();
  };

  return { uploadFile, downloadFile, isFileExisted, getFileProperties };
};
