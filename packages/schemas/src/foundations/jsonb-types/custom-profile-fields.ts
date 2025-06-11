import { z } from 'zod';

export enum CustomProfileFieldType {
  /* Primitive types */
  Text = 'Text',
  Number = 'Number',
  Date = 'Date',
  Checkbox = 'Checkbox',
  Select = 'Select',
  Url = 'Url',
  Regex = 'Regex',
  /* Composite types */
  Address = 'Address',
  Fullname = 'Fullname',
}

export const customProfileFieldTypeGuard = z.nativeEnum(CustomProfileFieldType);

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

export const customProfileFieldConfigGuard = z.object({
  placeholder: z.string().max(256).optional(),
  minLength: z.number().int().optional(),
  maxLength: z.number().int().optional(),
  minValue: z.number().int().optional(),
  maxValue: z.number().int().optional(),
  format: z.string().max(128).optional(),
  options: fieldOptionsGuard.optional(),
  parts: fieldPartsGuard.optional(),
});

export type CustomProfileFieldConfig = z.infer<typeof customProfileFieldConfigGuard>;
