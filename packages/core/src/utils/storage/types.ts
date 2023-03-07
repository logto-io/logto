export type UploadFileOptions = {
  contentType?: string;
  publicUrl?: string;
};

export type UploadFile = (
  data: Buffer,
  objectKey: string,
  options?: UploadFileOptions
) => Promise<{ url: string }>;
