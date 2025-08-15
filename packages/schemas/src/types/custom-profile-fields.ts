import { type ToZodObject } from '@logto/connector-kit';
import { z } from 'zod';

import { Users } from '../db-entries/user.js';
import {
  CustomProfileFieldType,
  customProfileFieldTypeGuard,
  fieldPartGuard,
  type UserProfile,
  userProfileAddressKeys,
  userProfileGuard,
} from '../foundations/index.js';

import { userOnboardingDataKey } from './onboarding.js';
import { defaultTenantIdKey } from './tenant.js';
import { consoleUserPreferenceKey, guideRequestsKey } from './user.js';

export type BaseProfileField = {
  name: string;
  label?: string;
  description?: string;
  type: CustomProfileFieldType;
  required: boolean;
};

const baseProfileFieldGuard = z.object({
  name: z.string(),
  type: customProfileFieldTypeGuard,
  label: z.string().min(1).optional(),
  description: z.string().optional(),
  required: z.boolean(),
}) satisfies ToZodObject<BaseProfileField>;

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
    customFormat?: string;
  };
};

export const dateProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Date),
  config: z
    .object({
      placeholder: z.string().optional(),
      format: z.string(),
      customFormat: z.string().optional(),
    })
    .optional(),
}) satisfies ToZodObject<DateProfileField>;

export type CheckboxProfileField = Omit<BaseProfileField, 'description'> & {
  type: CustomProfileFieldType.Checkbox;
  required: false;
  config?: {
    defaultValue: 'true' | 'false';
  };
};

export const checkboxProfileFieldGuard = baseProfileFieldGuard.omit({ description: true }).extend({
  type: z.literal(CustomProfileFieldType.Checkbox),
  required: z.literal(false),
  config: z
    .object({
      defaultValue: z.literal('true').or(z.literal('false')),
    })
    .optional(),
}) satisfies ToZodObject<CheckboxProfileField>;

export type SelectProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Select;
  config: {
    placeholder?: string;
    options: Array<{ label?: string; value: string }>;
  };
};

export const selectProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Select),
  config: z.object({
    placeholder: z.string().optional(),
    options: z.array(z.object({ label: z.string().optional(), value: z.string() })),
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
    parts: Array<{
      enabled: boolean;
      name: keyof Exclude<UserProfile['address'], undefined>;
      type: CustomProfileFieldType;
      label?: string;
      description?: string;
      required: boolean;
      config?: {
        placeholder?: string;
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
        options?: Array<{ label?: string; value: string }>;
        format?: string;
        customFormat?: string;
      };
    }>;
  };
};

export const addressProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Address),
  config: z.object({
    parts: z.array(
      fieldPartGuard.omit({ name: true }).extend({
        name: z.enum(userProfileAddressKeys),
      })
    ),
  }),
}) satisfies ToZodObject<AddressProfileField>;

export type FullnameProfileField = BaseProfileField & {
  type: CustomProfileFieldType.Fullname;
  config: {
    parts: Array<{
      enabled: boolean;
      name: keyof Pick<UserProfile, 'givenName' | 'middleName' | 'familyName'>;
      type: CustomProfileFieldType;
      label?: string;
      description?: string;
      required: boolean;
      config?: {
        placeholder?: string;
        minLength?: number;
        maxLength?: number;
        minValue?: number;
        maxValue?: number;
        options?: Array<{ label?: string; value: string }>;
        format?: string;
        customFormat?: string;
      };
    }>;
  };
};

export const fullnameKeys = userProfileGuard
  .pick({
    givenName: true,
    middleName: true,
    familyName: true,
  })
  .keyof().options;

export const fullnameProfileFieldGuard = baseProfileFieldGuard.extend({
  type: z.literal(CustomProfileFieldType.Fullname),
  config: z.object({
    parts: z.array(
      fieldPartGuard.omit({ name: true }).extend({
        name: z.enum(fullnameKeys),
      })
    ),
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

export const nameAndAvatarGuard = z
  .object({
    name: z.string(),
    avatar: z.string().url().or(z.literal('')),
  })
  .partial();

export const builtInProfileGuard = nameAndAvatarGuard.merge(
  z.object({ profile: userProfileGuard })
);

export const builtInCustomProfileFieldKeys = Object.freeze(
  builtInProfileGuard.merge(userProfileGuard).keyof().options
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

/**
 * Reserved custom data keys, which are used by the system and should not be used by custom profile fields.
 */
export const reservedCustomDataKeyGuard = z
  .object({
    [userOnboardingDataKey]: z.string(),
    [guideRequestsKey]: z.string(),
    [consoleUserPreferenceKey]: z.string(),
    [defaultTenantIdKey]: z.string(),
  })
  .partial();
export const reservedCustomDataKeys = Object.freeze(reservedCustomDataKeyGuard.keyof().options);

/**
 * Disallow sign-in identifiers related field keys in custom profile fields, as this is conflicting
 * with the built-in sign-in/sign-up experience flows.
 */
export const signInIdentifierKeyGuard = Users.createGuard
  .pick({
    username: true,
    primaryEmail: true,
    primaryPhone: true,
  })
  .extend({
    email: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
  });
export const reservedSignInIdentifierKeys = Object.freeze(signInIdentifierKeyGuard.keyof().options);

/**
 * Reserved user profile keys.
 * Currently only `preferredUsername` is reserved since it is the standard username property used
 * by most identity providers. Should not allow user updating this field via profile related APIs.
 */
export const reservedBuiltInProfileKeyGuard = userProfileGuard.pick({ preferredUsername: true });
export const reservedBuiltInProfileKeys = Object.freeze(
  reservedBuiltInProfileKeyGuard.keyof().options
);

export enum SupportedDateFormat {
  US = 'MM/dd/yyyy',
  UK = 'dd/MM/yyyy',
  ISO = 'yyyy-MM-dd',
  Custom = 'custom',
}

export enum Gender {
  Female = 'female',
  Male = 'male',
  Other = 'prefer_not_to_say',
}
