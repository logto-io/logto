import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

import type { UploadFile } from './types.js';

export const buildS3Storage = (
  endpoint: string,
  bucket: string,
  accessKeyId: string,
  secretAccessKey: string
) => {
  // Endpoint example: s3.us-west-2.amazonaws.com
  const region = /s3\.([^.]*)\.amazonaws/.exec(endpoint)?.[1];

  if (!region) {
    throw new Error('Invalid S3 endpoint, can not find region');
  }

  const client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const uploadFile: UploadFile = async (
    data: Buffer,
    objectKey: string,
    { contentType, publicUrl } = {}
  ) => {
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: data,
      ContentType: contentType,
      ACL: 'public-read',
    });

    await client.send(command);

    if (publicUrl) {
      return { url: `${publicUrl}/${objectKey}` };
    }

    return {
      url: `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`,
    };
  };

  return { uploadFile };
};
