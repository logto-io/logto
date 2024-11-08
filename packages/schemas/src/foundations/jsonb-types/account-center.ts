import { z } from 'zod';

export enum AccountCenterControlValue {
  Off = 'Off',
  ReadOnly = 'ReadOnly',
  Edit = 'Edit',
}

// Control list of each field in the account center (profile API)
// all fields are optional, if not set, the default value is `Off`
// this can make the alteration of the field control easier
export const accountCenterFieldControlGuard = z
  .object({
    name: z.nativeEnum(AccountCenterControlValue),
    avatar: z.nativeEnum(AccountCenterControlValue),
    profile: z.nativeEnum(AccountCenterControlValue),
    email: z.nativeEnum(AccountCenterControlValue),
    phone: z.nativeEnum(AccountCenterControlValue),
    password: z.nativeEnum(AccountCenterControlValue),
    username: z.nativeEnum(AccountCenterControlValue),
    social: z.nativeEnum(AccountCenterControlValue),
    customData: z.nativeEnum(AccountCenterControlValue),
  })
  .partial();

export type AccountCenterFieldControl = z.infer<typeof accountCenterFieldControlGuard>;
