import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { type UserProfile } from './users.js';

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

export enum ProfileFieldType {
  /* Primitive types */
  Text = 'text',
  Number = 'number',
  Date = 'date',
  Checkbox = 'checkbox',
  Dropdown = 'dropdown',
  Url = 'url',
  Regex = 'regex',
  /* Composite types */
  Address = 'address',
  Fullname = 'fullname',
}

export type BaseProfileField = {
  label?: string;
  description?: string;
  type: ProfileFieldType;
  required?: boolean;
  placeholder?: string;
};

export type TextProfileField = BaseProfileField & {
  type: ProfileFieldType.Text;
  minLength?: number;
  maxLength?: number;
};

export type NumberProfileField = BaseProfileField & {
  type: ProfileFieldType.Number;
  minValue?: number;
  maxValue?: number;
};

export type DateProfileField = BaseProfileField & {
  type: ProfileFieldType.Date;
  format?: string;
};

export type CheckboxProfileField = BaseProfileField & {
  type: ProfileFieldType.Checkbox;
  options?: Array<{ label: string; value: string }>;
};

export type DropdownProfileField = BaseProfileField & {
  type: ProfileFieldType.Dropdown;
  options?: Array<{ label: string; value: string }>;
};

export type AddressProfileField = BaseProfileField & {
  type: ProfileFieldType.Address;
  parts?: Array<{ key: keyof UserProfile['address']; enabled: boolean }>;
};

export type FullnameProfileField = BaseProfileField & {
  type: ProfileFieldType.Fullname;
  parts?: Array<{
    key: keyof Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;
    enabled: boolean;
  }>;
};

export type UserProfileField =
  | BaseProfileField
  | TextProfileField
  | NumberProfileField
  | DateProfileField
  | CheckboxProfileField
  | DropdownProfileField
  | AddressProfileField
  | FullnameProfileField;

export const userProfileFieldGuard = z.object({
  type: z.nativeEnum(ProfileFieldType),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
  format: z.string().optional(),
  options: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  parts: z.array(z.object({ key: z.string(), enabled: z.boolean() })).optional(),
}) satisfies ToZodObject<UserProfileField>;

export const userProfileFieldsGuard = z.record(userProfileFieldGuard);

export type UserProfileFields = z.infer<typeof userProfileFieldsGuard>;

type ProfileFieldsMetadata = {
  [key in keyof UserProfile]: UserProfileField;
};

export const profileFieldsMetadata: ProfileFieldsMetadata = Object.freeze({
  familyName: {
    type: ProfileFieldType.Text,
    minLength: 1,
    maxLength: 100,
  },
  givenName: {
    type: ProfileFieldType.Text,
    minLength: 1,
    maxLength: 100,
  },
  fullname: {
    type: ProfileFieldType.Fullname,
    parts: [
      { key: 'givenName', enabled: true },
      { key: 'middleName', enabled: true },
      { key: 'familyName', enabled: true },
    ],
  },
  gender: {
    type: ProfileFieldType.Dropdown,
    options: [
      { label: 'Male', value: 'male' },
      { label: 'Female', value: 'female' },
      { label: 'Rather not say', value: 'others' },
    ],
  },
  birthdate: {
    type: ProfileFieldType.Date,
    format: 'MM-dd-yyyy',
  },
  address: {
    type: ProfileFieldType.Address,
    parts: [
      { key: 'formatted', enabled: true },
      { key: 'streetAddress', enabled: true },
      { key: 'locality', enabled: true },
      { key: 'region', enabled: true },
      { key: 'postalCode', enabled: true },
      { key: 'country', enabled: true },
    ],
  },
});
