import { BlobServiceClient } from '@azure/storage-blob';

export const buildAzureStorage = (connectionString: string, container: string) => {
  const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(container);

  const uploadFile = async (data: Buffer, objectKey: string, mimeType: string) => {
    const blockBlobClient = containerClient.getBlockBlobClient(objectKey);

    const response = await blockBlobClient.uploadData(data, {
      blobHTTPHeaders: { blobContentType: mimeType },
    });

    return response;
  };

  return { uploadFile };
};
