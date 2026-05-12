import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  CopyObjectCommand,
} from '@aws-sdk/client-s3';

import type { UploadFile } from './types.js';

const getRegionFromEndpoint = (endpoint?: string) => {
  if (!endpoint) {
    return;
  }

  return /s3\.([^.]*)\.amazonaws/.exec(endpoint)?.[1];
};

type BuildS3StorageParameters = {
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  endpoint?: string;
  forcePathStyle?: boolean;
};

export const buildS3Storage = ({
  bucket,
  accessKeyId,
  secretAccessKey,
  region,
  endpoint,
  forcePathStyle,
}: BuildS3StorageParameters) => {
  if (!region && !endpoint) {
    throw new Error('Either region or endpoint must be provided');
  }

  // Endpoint example: s3.us-west-2.amazonaws.com
  const finalRegion = region ?? getRegionFromEndpoint(endpoint) ?? 'us-east-1';

  const client = new S3Client({
    region: finalRegion,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const uploadFile: UploadFile = async (data, objectKey, { contentType, publicUrl } = {}) => {
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

    if (endpoint) {
      // Custom endpoint URL construction
      if (forcePathStyle) {
        // Path-style URL: https://endpoint/bucket/key
        return {
          url: `${endpoint}/${bucket}/${objectKey}`,
        };
      }
      // Virtual-hosted style URL: https://bucket.endpoint/key
      return {
        url: `${endpoint.replace(/^(https?:\/\/)/, `$1${bucket}.`)}/${objectKey}`,
      };
    }

    // AWS S3 standard URL construction
    if (forcePathStyle) {
      // Path-style URL: https://s3.region.amazonaws.com/bucket/key
      return {
        url: `https://s3.${finalRegion}.amazonaws.com/${bucket}/${objectKey}`,
      };
    }
    // Virtual-hosted style URL: https://bucket.s3.region.amazonaws.com/key
    return {
      url: `https://${bucket}.s3.${finalRegion}.amazonaws.com/${objectKey}`,
    };
  };

  const deleteFile = async (objectKey: string): Promise<void> => {
    try {
      await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: objectKey }));
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFound') {
        return;
      }
      throw error;
    }
  };

  const isFileExisted = async (objectKey: string): Promise<boolean> => {
    try {
      await client.send(new HeadObjectCommand({ Bucket: bucket, Key: objectKey }));
      return true;
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFound') {
        return false;
      }
      throw error;
    }
  };

  const listFiles = async (prefix: string): Promise<string[]> => {
    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
      try {
        const result = await client.send(
          new ListObjectsV2Command({
            Bucket: bucket,
            Prefix: prefix,
            ...(continuationToken ? { ContinuationToken: continuationToken } : {}),
          })
        );

        if (result.Contents) {
          for (const item of result.Contents) {
            if (item.Key) {
              keys.push(item.Key);
            }
          }
        }

        continuationToken = result.IsTruncated ? result.NextContinuationToken : undefined;
      } catch (error: unknown) {
        // fast-xml-parser < 5.8 can't parse RustFS/MinIO XML entity refs like &#xD;
        if (error instanceof Error && error.message.includes('Invalid character')) {
          break;
        }
        throw error;
      }
    } while (continuationToken);

    return keys;
  };

  const downloadFile = async (
    objectKey: string
  ): Promise<{ body: ReadableStream; contentType?: string; contentLength?: number }> => {
    const result = await client.send(new GetObjectCommand({ Bucket: bucket, Key: objectKey }));

    return {
      body: result.Body!.transformToWebStream(),
      contentType: result.ContentType,
      contentLength: result.ContentLength,
    };
  };

  const copyFile = async (sourceKey: string, destKey: string): Promise<void> => {
    await client.send(
      new CopyObjectCommand({
        Bucket: bucket,
        CopySource: `${bucket}/${sourceKey}`,
        Key: destKey,
        ACL: 'public-read',
      })
    );
  };

  return { uploadFile, deleteFile, isFileExisted, listFiles, downloadFile, copyFile };
};
