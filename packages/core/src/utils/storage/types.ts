type UploadFileOptions = {
  contentType?: string;
  publicUrl?: string;
};

export type UploadFile<T extends Uint8Array = Uint8Array> = (
  data: T,
  objectKey: string,
  options?: UploadFileOptions
) => Promise<{ url: string }>;

export type DownloadFileResult = {
  body: ReadableStream;
  contentType?: string;
  contentLength?: number;
};

export type StorageProvider = {
  uploadFile: UploadFile | UploadFile<Buffer>;
  deleteFile?: (objectKey: string) => Promise<void>;
  isFileExisted?: (objectKey: string) => Promise<boolean>;
  listFiles?: (prefix: string) => Promise<string[]>;
  downloadFile?: (objectKey: string) => Promise<DownloadFileResult>;
  copyFile?: (sourceKey: string, destKey: string) => Promise<void>;
};
