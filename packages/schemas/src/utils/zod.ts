import { type z } from 'zod';

export type ToZodObject<T> = z.ZodObject<{
  [K in keyof T]-?: z.ZodType<T[K]>;
}>;
