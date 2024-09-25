import {
  type BlobDownloadOptions,
  type BlobDownloadResponseParsed,
  type BlobGetPropertiesResponse,
  BlobServiceClient,
} from '@azure/storage-blob';

import type { UploadFile } from './types.js';

const defaultPublicDomain = 'blob.core.windows.net';

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
    return blockBlobClient.exists();
  };

  const getFileProperties = async (objectKey: string) => {
    const blockBlobClient = containerClient.getBlockBlobClient(objectKey);
    return blockBlobClient.getProperties();
  };

  return { uploadFile, downloadFile, isFileExisted, getFileProperties };
};
