import { Storage as GoogleCloudStorage } from '@google-cloud/storage';

import type {
  DownloadFile,
  GetFileProperties,
  IsFileExisted,
  Storage,
  UploadFile,
} from './types.js';

const defaultPublicDomain = 'storage.googleapis.com';

/** Google reports the object size as a string of bytes. */
const toContentLength = (size?: string | number) => (size === undefined ? undefined : Number(size));

export const buildGoogleStorage = (projectId: string, keyFilename: string, bucketName: string) => {
  const storage = new GoogleCloudStorage({ projectId, keyFilename });
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

  const downloadFile: DownloadFile = async (objectKey, offset, count) => {
    const file = bucket.file(objectKey);
    const [{ contentType, size }] = await file.getMetadata();
    const totalSize = toContentLength(size) ?? 0;
    const start = offset ?? 0;
    // `end` is inclusive, like the HTTP `Range` header.
    const end = count === undefined ? undefined : start + count - 1;
    const contentLength =
      (end === undefined ? totalSize : Math.min(end + 1, totalSize)) - Math.min(start, totalSize);

    return {
      contentLength,
      contentType,
      readableStreamBody:
        offset === undefined && count === undefined
          ? file.createReadStream()
          : file.createReadStream({ start, end }),
    };
  };

  const isFileExisted: IsFileExisted = async (objectKey) => {
    const [exists] = await bucket.file(objectKey).exists();

    return exists;
  };

  const getFileProperties: GetFileProperties = async (objectKey) => {
    const [{ size }] = await bucket.file(objectKey).getMetadata();

    return { contentLength: toContentLength(size) };
  };

  return { uploadFile, downloadFile, isFileExisted, getFileProperties } satisfies Storage;
};
