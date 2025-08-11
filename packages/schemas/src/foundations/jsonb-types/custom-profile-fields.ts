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
  label: z.string().optional(),
  value: z.string(),
});

export type FieldOption = z.infer<typeof fieldOptionGuard>;

export const fieldOptionsGuard = fieldOptionGuard.array();
export type FieldOptions = z.infer<typeof fieldOptionsGuard>;

export const baseConfigGuard = z.object({
  placeholder: z.string().max(256).optional(),
  minLength: z.number().int().min(0).optional(),
  maxLength: z.number().int().min(0).optional(),
  minValue: z.number().int().min(0).optional(),
  maxValue: z.number().int().min(0).optional(),
  format: z.string().max(128).optional(),
  customFormat: z.string().max(128).optional(),
  options: fieldOptionsGuard.optional(),
  defaultValue: z.string().optional(),
});

export const fieldPartGuard = z.object({
  enabled: z.boolean(),
  name: z.string(),
  type: customProfileFieldTypeGuard,
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  required: z.boolean(),
  config: baseConfigGuard.optional(),
});

export type FieldPart = z.infer<typeof fieldPartGuard>;

export const fieldPartsGuard = fieldPartGuard.array();
export type FieldParts = z.infer<typeof fieldPartsGuard>;

export const customProfileFieldConfigGuard = baseConfigGuard.extend({
  parts: fieldPartsGuard.optional(),
});

export type CustomProfileFieldBaseConfig = z.infer<typeof baseConfigGuard>;
export type CustomProfileFieldConfig = z.infer<typeof customProfileFieldConfigGuard>;
