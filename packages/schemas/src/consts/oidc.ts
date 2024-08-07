import { z } from 'zod';

import { type CustomClientMetadata } from '../foundations/index.js';
import { type ToZodObject } from '../utils/zod.js';

import { inSeconds } from './date.js';

export const tenantIdKey = 'tenant_id';

export const customClientMetadataDefault = Object.freeze({
  idTokenTtl: inSeconds.oneHour,
  refreshTokenTtlInDays: 14,
  rotateRefreshToken: true,
} as const satisfies Partial<CustomClientMetadata>);

export enum ExtraParamsKey {
  /**
   * @deprecated Use {@link FirstScreen} instead.
   * @see {@link InteractionMode} for the available values.
   */
  InteractionMode = 'interaction_mode',
  /**
   * The first screen to show for the user.
   *
   * @see {@link FirstScreen} for the available values.
   */
  FirstScreen = 'first_screen',
  /**
   * Directly sign in via the specified method. Note that the method must be properly configured
   * in Logto.
   *
   * @remark
   * The format of the value for this key is one of the following:
   *
   * - `social:<target>` (Use a social connector with the specified target, e.g. `social:google`)
   * - `sso:<connector-id>` (Use the specified SSO connector, e.g. `sso:123456`)
   */
  DirectSignIn = 'direct_sign_in',
  /**
   * Override the default sign-in experience configuration with the settings from the specified
   * organization ID.
   */
  OrganizationId = 'organization_id',
  /**
   * Provides a hint about the login identifier the user might use.
   * This can be used to pre-fill the identifier field **only on the first screen** of the sign-in/sign-up flow.
   */
  LoginHint = 'login_hint',
}

/** @deprecated Use {@link FirstScreen} instead. */
export enum InteractionMode {
  SignIn = 'signIn',
  SignUp = 'signUp',
}

export enum FirstScreen {
  SignIn = 'signIn',
  Register = 'register',
}

export const extraParamsObjectGuard = z
  .object({
    [ExtraParamsKey.InteractionMode]: z.nativeEnum(InteractionMode),
    [ExtraParamsKey.FirstScreen]: z.nativeEnum(FirstScreen),
    [ExtraParamsKey.DirectSignIn]: z.string(),
    [ExtraParamsKey.OrganizationId]: z.string(),
    [ExtraParamsKey.LoginHint]: z.string(),
  })
  .partial() satisfies ToZodObject<ExtraParamsObject>;

export type ExtraParamsObject = Partial<{
  [ExtraParamsKey.InteractionMode]: InteractionMode;
  [ExtraParamsKey.FirstScreen]: FirstScreen;
  [ExtraParamsKey.DirectSignIn]: string;
  [ExtraParamsKey.OrganizationId]: string;
  [ExtraParamsKey.LoginHint]: string;
}>;
