import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { CustomProfileFields } from '../db-entries/index.js';
import { Users } from '../db-entries/user.js';
import {
  type UserProfile,
  userProfileAddressKeys,
  userProfileGuard,
} from '../foundations/jsonb-types/users.js';

export enum ProfileFieldType {
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

export type BaseProfileField = {
  name: string;
  label?: string;
  description?: string;
  type: ProfileFieldType;
  required?: boolean;
  placeholder?: string;
};

const baseProfileFieldGuard = z.object({
  name: z.string(),
  type: z.nativeEnum(ProfileFieldType),
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
});

export type TextProfileField = BaseProfileField & {
  type: ProfileFieldType.Text;
  minLength?: number;
  maxLength?: number;
};

export const textProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Text),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
}) satisfies ToZodObject<TextProfileField>;

export type NumberProfileField = BaseProfileField & {
  type: ProfileFieldType.Number;
  minValue?: number;
  maxValue?: number;
};

export const numberProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Number),
  minValue: z.number().optional(),
  maxValue: z.number().optional(),
}) satisfies ToZodObject<NumberProfileField>;

export type DateProfileField = BaseProfileField & {
  type: ProfileFieldType.Date;
  format: string;
};

export const dateProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Date),
  format: z.string(),
}) satisfies ToZodObject<DateProfileField>;

export type CheckboxProfileField = BaseProfileField & {
  type: ProfileFieldType.Checkbox;
  options: Array<{ label: string; value: string }>;
};

export const checkboxProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Checkbox),
  options: z.array(z.object({ label: z.string(), value: z.string() })),
}) satisfies ToZodObject<CheckboxProfileField>;

export type SelectProfileField = BaseProfileField & {
  type: ProfileFieldType.Select;
  options: Array<{ label: string; value: string }>;
};

export const selectProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Select),
  options: z.array(z.object({ label: z.string(), value: z.string() })),
}) satisfies ToZodObject<SelectProfileField>;

export type UrlProfileField = BaseProfileField & {
  type: ProfileFieldType.Url;
};

export const urlProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Url),
}) satisfies ToZodObject<UrlProfileField>;

export type RegexProfileField = BaseProfileField & {
  type: ProfileFieldType.Regex;
  format: string;
};

export const regexProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Regex),
  format: z.string(),
}) satisfies ToZodObject<RegexProfileField>;

export type AddressProfileField = BaseProfileField & {
  type: ProfileFieldType.Address;
  parts: Array<{ key: keyof Exclude<UserProfile['address'], undefined>; enabled: boolean }>;
};

export const addressProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Address),
  parts: z.array(
    z.object({
      key: z.enum(userProfileAddressKeys),
      enabled: z.boolean(),
    })
  ),
}) satisfies ToZodObject<AddressProfileField>;

export type FullnameProfileField = BaseProfileField & {
  type: ProfileFieldType.Fullname;
  parts: Array<{
    key: keyof Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;
    enabled: boolean;
  }>;
};

const fullnameKeys = userProfileGuard
  .pick({
    givenName: true,
    middleName: true,
    familyName: true,
  })
  .keyof().options;

export const fullnameProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(ProfileFieldType.Fullname),
  parts: z.array(z.object({ key: z.enum(fullnameKeys), enabled: z.boolean() })),
}) satisfies ToZodObject<FullnameProfileField>;

export type UserProfileField =
  | TextProfileField
  | NumberProfileField
  | DateProfileField
  | CheckboxProfileField
  | SelectProfileField
  | UrlProfileField
  | RegexProfileField
  | AddressProfileField
  | FullnameProfileField;

export const userProfileFieldGuard = z.discriminatedUnion('type', [
  textProfileFieldGuard,
  numberProfileFieldGuard,
  dateProfileFieldGuard,
  checkboxProfileFieldGuard,
  selectProfileFieldGuard,
  urlProfileFieldGuard,
  regexProfileFieldGuard,
  addressProfileFieldGuard,
  fullnameProfileFieldGuard,
]);

export const userProfileFieldsGuard = z.record(userProfileFieldGuard);

export type UserProfileFields = z.infer<typeof userProfileFieldsGuard>;

export const builtInCustomProfileFieldKeys = Object.freeze(
  userProfileGuard
    .merge(
      Users.createGuard.pick({
        name: true,
        primaryEmail: true,
        primaryPhone: true,
        avatar: true,
      })
    )
    .keyof().options
);

export const createCustomProfileFieldDataGuard = CustomProfileFields.createGuard.omit({
  tenantId: true,
  id: true,
  createdAt: true,
  sieOrder: true,
});

export type CreateCustomProfileFieldData = z.infer<typeof createCustomProfileFieldDataGuard>;

export const updateCustomProfileFieldDataGuard = CustomProfileFields.updateGuard.omit({
  tenantId: true,
  id: true,
  name: true,
  type: true,
  createdAt: true,
  sieOrder: true,
});

export type UpdateCustomProfileFieldData = z.infer<typeof updateCustomProfileFieldDataGuard>;

export const updateCustomProfileFieldSieOrderGuard = z.object({
  id: z.string(),
  sieOrder: z.number(),
});

export type UpdateCustomProfileFieldSieOrder = z.infer<
  typeof updateCustomProfileFieldSieOrderGuard
>;
