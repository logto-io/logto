import { number, object, string } from 'zod';

export const uploadFileGuard = object({
  filepath: string(),
  mimetype: string(),
  originalFilename: string(),
  size: number(),
});
