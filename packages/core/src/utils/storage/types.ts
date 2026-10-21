type UploadFileOptions = {
  contentType?: string;
  publicUrl?: string;
  /**
   * Whether the object has to be publicly readable. Only the S3 provider reads it, where it
   * defaults to `true`.
   */
  isPublic?: boolean;
};

export type UploadFile<T extends Uint8Array = Uint8Array> = (
  data: T,
  objectKey: string,
  options?: UploadFileOptions
) => Promise<{ url: string }>;

/**
 * The downloaded object, in the shape of the Azure `BlobDownloadResponseParsed` fields Core reads,
 * so every provider can be served the same way.
 */
type DownloadFileResponse = {
  /** The size of the returned body in bytes, i.e. of the requested range when there is one. */
  contentLength?: number;
  contentType?: string;
  readableStreamBody?: NodeJS.ReadableStream;
};

/**
 * Download an object, or `count` bytes of it starting at `offset` when either is set, like the Azure
 * Blob `download(offset, count)`.
 */
export type DownloadFile = (
  objectKey: string,
  offset?: number,
  count?: number
) => Promise<DownloadFileResponse>;

export type IsFileExisted = (
  objectKey: string,
  options?: {
    /**
     * Rethrow transient network errors instead of treating them as a missing object. Only the Azure
     * provider reports a missing blob that way; the other providers always rethrow.
     */
    throwOnTransientError?: boolean;
  }
) => Promise<boolean>;

export type GetFileProperties = (objectKey: string) => Promise<{ contentLength?: number }>;

/** A storage provider that can store objects and read them back. */
export type Storage = {
  // eslint-disable-next-line @typescript-eslint/ban-types -- Google doesn't allow us to use Uint8Array
  uploadFile: UploadFile<Buffer>;
  downloadFile: DownloadFile;
  isFileExisted: IsFileExisted;
  getFileProperties: GetFileProperties;
};
