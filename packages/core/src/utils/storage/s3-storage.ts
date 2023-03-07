import AWS from 'aws-sdk';

import type { UploadFile } from './types.js';

export const buildS3Storage = (
  endpoint: string,
  bucket: string,
  accessKeyId: string,
  secretAccessKey: string
) => {
  const s3 = new AWS.S3({
    endpoint,
    accessKeyId,
    secretAccessKey,
  });

  const uploadFile: UploadFile = async (
    data: Buffer,
    objectKey: string,
    { contentType, publicUrl } = {}
  ) => {
    const { Location, Key } = await s3
      .upload({
        Body: data,
        Key: objectKey,
        Bucket: bucket,
        ContentType: contentType,
      })
      .promise();

    if (publicUrl) {
      return { url: `${publicUrl}/${objectKey}` };
    }

    return {
      url: Location,
    };
  };

  return { uploadFile };
};
