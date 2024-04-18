type UploadFileOptions = {
  contentType?: string;
  publicUrl?: string;
};

export type UploadFile<T extends Uint8Array = Uint8Array> = (
  data: T,
  objectKey: string,
  options?: UploadFileOptions
) => Promise<{ url: string }>;
