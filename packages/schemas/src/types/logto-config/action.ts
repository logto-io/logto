import { jsonGuard } from '@logto/connector-kit';
import { z } from 'zod';

import type { Json } from '../../foundations/index.js';
import type { InteractionEvent, InteractionIdentifier } from '../interactions.js';
import { userInfoGuard, type UserInfo } from '../user.js';
import type { VerificationType } from '../verification-records/index.js';

import type { JwtCustomizerUserContext } from './jwt-customizer.js';

export enum LogtoActionKey {
  /**
   * These values are persisted as keys in `logto_configs`. Keep the legacy `inlineHook` prefix so
   * existing action configurations remain readable across upgrades and downgrades.
   */
  PostFirstFactorVerification = 'inlineHook.postFirstFactorVerification',
  PostSignIn = 'inlineHook.postSignIn',
}

export const actionExecutionErrorPolicies = Object.freeze(['block', 'allow'] as const);

export type ActionExecutionErrorPolicy = (typeof actionExecutionErrorPolicies)[number];

export type LogtoAction = {
  script: string;
  environmentVariables?: Record<string, string>;
  contextSample?: Json;
  enabled?: boolean;
  onExecutionError?: ActionExecutionErrorPolicy;
};

export const logtoActionGuard = z
  .object({
    script: z.string(),
    environmentVariables: z.record(z.string()).optional(),
    contextSample: jsonGuard.optional(),
    enabled: z.boolean().optional(),
    onExecutionError: z.enum(actionExecutionErrorPolicies).optional(),
  })
  .strict() satisfies z.ZodType<LogtoAction>;

/**
 * Shared execution payload for production Actions and Management API dry runs.
 * Cloud remote execution and the local VM runner both accept this shape.
 */
export const actionExecutionRequestBodyGuard = z
  .object({
    script: z.string(),
    actionType: z.nativeEnum(LogtoActionKey),
    event: jsonGuard,
    environmentVariables: z.record(z.string()).optional(),
  })
  .strict();

export type ActionExecutionRequestBody = z.infer<typeof actionExecutionRequestBodyGuard>;

export type ActionUser = Pick<
  UserInfo,
  'id' | 'username' | 'primaryEmail' | 'primaryPhone' | 'name' | 'avatar' | 'customData' | 'profile'
>;

export const actionUserPatchGuard = userInfoGuard
  .pick({
    username: true,
    primaryEmail: true,
    primaryPhone: true,
    name: true,
    avatar: true,
    customData: true,
    profile: true,
  })
  .partial();

export type ActionUserPatch = z.infer<typeof actionUserPatchGuard>;

export type PostFirstFactorVerificationEvent = {
  key: LogtoActionKey.PostFirstFactorVerification;
  interactionEvent: InteractionEvent.SignIn;
  verificationType: VerificationType.Password;
  identifier: InteractionIdentifier;
  user: ActionUser | null;
  /** Sensitive credential provided for Action-controlled password verification. */
  password: string;
};

export type PostSignInEvent = {
  key: LogtoActionKey.PostSignIn;
  interactionEvent: InteractionEvent.SignIn;
  user: JwtCustomizerUserContext;
};

// Nested `user` uses passthrough so password fields survive structural parsing.
export const postFirstFactorVerificationResultGuard = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('createUser'),
    user: actionUserPatchGuard.passthrough(),
    passwordVerified: z.literal(true),
  }),
  z.object({
    action: z.literal('updateUser'),
    user: actionUserPatchGuard.passthrough(),
    passwordVerified: z.literal(true),
  }),
]);

export type PostFirstFactorVerificationResult = z.infer<
  typeof postFirstFactorVerificationResultGuard
>;

// Nested `user` uses passthrough so password fields survive structural parsing.
export const postSignInResultGuard = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('updateUser'),
    user: actionUserPatchGuard.passthrough().optional(),
  }),
]);

export type PostSignInResult = z.infer<typeof postSignInResultGuard>;
