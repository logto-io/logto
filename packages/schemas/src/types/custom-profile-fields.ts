import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { Users } from '../db-entries/user.js';
import {
  CustomProfileFieldType,
  customProfileFieldTypeGuard,
  type UserProfile,
  userProfileAddressKeys,
  userProfileGuard,
} from '../foundations/index.js';

export type BaseProfileField = {
  name: string;
  label?: string;
  description?: string;
  type: CustomProfileFieldType;
  required?: boolean;
};

const baseProfileFieldGuard = z.object({
  name: z.string(),
  type: customProfileFieldTypeGuard,
  label: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional(),
});

export type TextProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Text;
  config?: {
    placeholder?: string;
    minLength?: number;
    maxLength?: number;
  };
};

export const textProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Text),
  config: z
    .object({
      placeholder: z.string().optional(),
      minLength: z.number().optional(),
      maxLength: z.number().optional(),
    })
    .optional(),
}) satisfies ToZodObject<TextProfileField>;

export type NumberProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Number;
  config?: {
    placeholder?: string;
    minValue?: number;
    maxValue?: number;
  };
};

export const numberProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Number),
  config: z
    .object({
      placeholder: z.string().optional(),
      minValue: z.number().optional(),
      maxValue: z.number().optional(),
    })
    .optional(),
}) satisfies ToZodObject<NumberProfileField>;

export type DateProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Date;
  config?: {
    placeholder?: string;
    format: string;
  };
};

export const dateProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Date),
  config: z
    .object({
      placeholder: z.string().optional(),
      format: z.string(),
    })
    .optional(),
}) satisfies ToZodObject<DateProfileField>;

export type CheckboxProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Checkbox;
  config: {
    options: Array<{ label: string; value: string }>;
  };
};

export const checkboxProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Checkbox),
  config: z.object({
    options: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
}) satisfies ToZodObject<CheckboxProfileField>;

export type SelectProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Select;
  config: {
    placeholder?: string;
    options: Array<{ label: string; value: string }>;
  };
};

export const selectProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Select),
  config: z.object({
    placeholder: z.string().optional(),
    options: z.array(z.object({ label: z.string(), value: z.string() })),
  }),
}) satisfies ToZodObject<SelectProfileField>;

export type UrlProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Url;
  config?: {
    placeholder?: string;
  };
};

export const urlProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Url),
  config: z
    .object({
      placeholder: z.string().optional(),
    })
    .optional(),
}) satisfies ToZodObject<UrlProfileField>;

export type RegexProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Regex;
  config: {
    placeholder?: string;
    format: string;
  };
};

export const regexProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Regex),
  config: z.object({
    placeholder: z.string().optional(),
    format: z.string(),
  }),
}) satisfies ToZodObject<RegexProfileField>;

export type AddressProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Address;
  config: {
    parts: Array<{ key: keyof Exclude<UserProfile['address'], undefined>; enabled: boolean }>;
  };
};

export const addressProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Address),
  config: z.object({
    parts: z.array(
      z.object({
        key: z.enum(userProfileAddressKeys),
        enabled: z.boolean(),
      })
    ),
  }),
}) satisfies ToZodObject<AddressProfileField>;

export type FullnameProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Fullname;
  config: {
    parts: Array<{
      key: keyof Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;
      enabled: boolean;
    }>;
  };
};

const fullnameKeys = userProfileGuard
  .pick({
    givenName: true,
    middleName: true,
    familyName: true,
  })
  .keyof().options;

export const fullnameProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Fullname),
  config: z.object({
    parts: z.array(z.object({ key: z.enum(fullnameKeys), enabled: z.boolean() })),
  }),
}) satisfies ToZodObject<FullnameProfileField>;

export const customProfileFieldUnionGuard = z.discriminatedUnion('type', [
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

export type CustomProfileFieldUnion =
  | TextProfileField
  | NumberProfileField
  | DateProfileField
  | CheckboxProfileField
  | SelectProfileField
  | UrlProfileField
  | RegexProfileField
  | AddressProfileField
  | FullnameProfileField;

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

export const updateCustomProfileFieldDataGuard = z.discriminatedUnion('type', [
  textProfileFieldGuard.omit({ name: true }),
  numberProfileFieldGuard.omit({ name: true }),
  dateProfileFieldGuard.omit({ name: true }),
  checkboxProfileFieldGuard.omit({ name: true }),
  selectProfileFieldGuard.omit({ name: true }),
  urlProfileFieldGuard.omit({ name: true }),
  regexProfileFieldGuard.omit({ name: true }),
  addressProfileFieldGuard.omit({ name: true }),
  fullnameProfileFieldGuard.omit({ name: true }),
]);

export type UpdateCustomProfileFieldData = z.infer<typeof updateCustomProfileFieldDataGuard>;

export const updateCustomProfileFieldSieOrderGuard = z.object({
  name: z.string(),
  sieOrder: z.number(),
});

export type UpdateCustomProfileFieldSieOrder = z.infer<
  typeof updateCustomProfileFieldSieOrderGuard
>;
