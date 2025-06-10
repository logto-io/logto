import { z } from 'zod';

export const fieldOptionGuard = z.object({
  label: z.string(),
  value: z.string(),
});

export type FieldOption = z.infer<typeof fieldOptionGuard>;

export const fieldOptionsGuard = fieldOptionGuard.array();
export type FieldOptions = z.infer<typeof fieldOptionsGuard>;

export const fieldPartGuard = z.object({
  key: z.string(),
  enabled: z.boolean(),
});

export type FieldPart = z.infer<typeof fieldPartGuard>;

export const fieldPartsGuard = fieldPartGuard.array();
export type FieldParts = z.infer<typeof fieldPartsGuard>;
