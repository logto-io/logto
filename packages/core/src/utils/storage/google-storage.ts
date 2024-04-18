import { Storage } from '@google-cloud/storage';

import type { UploadFile } from './types.js';

const defaultPublicDomain = 'storage.googleapis.com';

export const buildGoogleStorage = (projectId: string, keyFilename: string, bucketName: string) => {
  const storage = new Storage({ projectId, keyFilename });
  const bucket = storage.bucket(bucketName);

  // eslint-disable-next-line @typescript-eslint/ban-types -- Google doesn't allow us to use Uint8Array
  const uploadFile: UploadFile<Buffer> = async (
    data,
    objectKey,
    { contentType, publicUrl } = {}
  ) => {
    const file = bucket.file(objectKey);

    await file.save(data, {
      contentType,
      public: Boolean(publicUrl),
    });

    if (publicUrl) {
      return { url: `${publicUrl}/${objectKey}` };
    }

    return {
      url: `https://${defaultPublicDomain}/${bucketName}/${objectKey}`,
    };
  };

  return { uploadFile };
};
