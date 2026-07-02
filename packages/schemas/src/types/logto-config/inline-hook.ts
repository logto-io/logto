import { jsonGuard, jsonObjectGuard } from '@logto/connector-kit';
import { z } from 'zod';

import { type User, Users } from '../../db-entries/index.js';
import { type Json, type JsonObject, userProfileGuard } from '../../foundations/index.js';
import type { InteractionEvent, InteractionIdentifier } from '../interactions.js';
import type { UserInfo } from '../user.js';

export enum LogtoInlineHookKey {
  PostFirstFactorVerification = 'inlineHook.postFirstFactorVerification',
  PostSignIn = 'inlineHook.postSignIn',
}

export const inlineHookExecutionErrorPolicies = Object.freeze(['block', 'allow'] as const);

export type InlineHookExecutionErrorPolicy = (typeof inlineHookExecutionErrorPolicies)[number];

export type InlineHook = {
  script: string;
  environmentVariables?: Record<string, string>;
  contextSample?: Json;
  enabled?: boolean;
  onExecutionError?: InlineHookExecutionErrorPolicy;
};

export const inlineHookGuard = z
  .object({
    script: z.string(),
    environmentVariables: z.record(z.string()).optional(),
    contextSample: jsonGuard.optional(),
    enabled: z.boolean().optional(),
    onExecutionError: z.enum(inlineHookExecutionErrorPolicies).optional(),
  })
  .strict() satisfies z.ZodType<InlineHook>;

export const inlineHookTestRequestBodyGuard = z
  .object({
    script: z.string(),
    hookType: z.nativeEnum(LogtoInlineHookKey),
    event: jsonGuard,
    environmentVariables: z.record(z.string()).optional(),
  })
  .strict();

export type InlineHookTestRequestBody = z.infer<typeof inlineHookTestRequestBodyGuard>;

export type HookUser = Pick<
  UserInfo,
  'id' | 'username' | 'primaryEmail' | 'primaryPhone' | 'name' | 'avatar' | 'customData' | 'profile'
>;

export const inlineHookUserDataNamespaceKey = 'inlineHook';

export type InlineHookUserData = Partial<Record<typeof inlineHookUserDataNamespaceKey, JsonObject>>;

export const inlineHookUserDataGuard = z
  .object({
    [inlineHookUserDataNamespaceKey]: jsonObjectGuard.optional(),
  })
  .strict() satisfies z.ZodType<InlineHookUserData>;

type HookProvisioningProfileBase = Partial<
  Pick<
    User,
    | 'name'
    | 'avatar'
    | 'username'
    | 'primaryEmail'
    | 'primaryPhone'
    | 'profile'
    | 'customData'
    | 'logtoConfig'
    | 'passwordEncrypted'
    | 'passwordEncryptionMethod'
  >
>;

export type HookProvisioningProfile = Omit<
  HookProvisioningProfileBase,
  'customData' | 'logtoConfig'
> & {
  customData?: InlineHookUserData;
  logtoConfig?: InlineHookUserData;
};

const hookProvisioningProfileBaseGuard = Users.createGuard
  .pick({
    name: true,
    avatar: true,
    username: true,
    primaryEmail: true,
    primaryPhone: true,
    profile: true,
    customData: true,
    logtoConfig: true,
    passwordEncrypted: true,
    passwordEncryptionMethod: true,
  })
  .extend({
    profile: userProfileGuard.optional(),
    customData: inlineHookUserDataGuard.optional(),
    logtoConfig: inlineHookUserDataGuard.optional(),
  })
  .strict();

export const hookProvisioningProfileGuard = hookProvisioningProfileBaseGuard.superRefine(
  ({ passwordEncrypted, passwordEncryptionMethod }, context) => {
    if (Boolean(passwordEncrypted) === Boolean(passwordEncryptionMethod)) {
      return;
    }

    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: '`passwordEncrypted` and `passwordEncryptionMethod` must be provided together.',
      path: passwordEncrypted ? ['passwordEncryptionMethod'] : ['passwordEncrypted'],
    });
  }
) satisfies z.ZodType<HookProvisioningProfile>;

export type HookUserPatch = HookProvisioningProfile;

export type PostFirstFactorVerificationEvent = {
  key: LogtoInlineHookKey.PostFirstFactorVerification;
  interactionEvent: InteractionEvent.SignIn;
  identifier: InteractionIdentifier;
  user: HookUser | null;
  /** Sensitive credential provided for inline hook controlled password verification. */
  password: string;
};

export type PostSignInEvent = {
  key: LogtoInlineHookKey.PostSignIn;
  interactionEvent: InteractionEvent.SignIn;
  user: HookUser;
};

export type PostFirstFactorVerificationResult = {
  action: 'createUser' | 'updateUser';
  user: HookUserPatch;
  passwordVerified: true;
};

export type PostSignInResult = {
  action: 'updateUser';
  user?: HookUserPatch;
};
