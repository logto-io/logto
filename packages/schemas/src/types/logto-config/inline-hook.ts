import { jsonGuard } from '@logto/connector-kit';
import { z } from 'zod';

import type { Json } from '../../foundations/index.js';
import type { InteractionEvent, InteractionIdentifier } from '../interactions.js';
import { userInfoGuard, type UserInfo } from '../user.js';
import type { VerificationType } from '../verification-records/index.js';

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

/**
 * Shared execution payload for production Inline Hooks and Management API dry runs.
 * Cloud remote execution and the local VM runner both accept this shape.
 */
export const inlineHookExecutionRequestBodyGuard = z
  .object({
    script: z.string(),
    hookType: z.nativeEnum(LogtoInlineHookKey),
    event: jsonGuard,
    environmentVariables: z.record(z.string()).optional(),
  })
  .strict();

export type InlineHookExecutionRequestBody = z.infer<typeof inlineHookExecutionRequestBodyGuard>;

/**
 * Kept as an alias so the Management API `POST /configs/inline-hooks/test` contract
 * stays compatible while production and dry-run share one execution request type.
 */
export const inlineHookTestRequestBodyGuard = inlineHookExecutionRequestBodyGuard;
export type InlineHookTestRequestBody = InlineHookExecutionRequestBody;

export type HookUser = Pick<
  UserInfo,
  'id' | 'username' | 'primaryEmail' | 'primaryPhone' | 'name' | 'avatar' | 'customData' | 'profile'
>;

export const hookUserPatchGuard = userInfoGuard
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

export type HookUserPatch = z.infer<typeof hookUserPatchGuard>;

export type PostFirstFactorVerificationEvent = {
  key: LogtoInlineHookKey.PostFirstFactorVerification;
  interactionEvent: InteractionEvent.SignIn;
  verificationType: VerificationType.Password;
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

// Nested `user` uses passthrough so password fields survive structural parsing.
export const postFirstFactorVerificationResultGuard = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('createUser'),
    user: hookUserPatchGuard.passthrough(),
    passwordVerified: z.literal(true),
  }),
  z.object({
    action: z.literal('updateUser'),
    user: hookUserPatchGuard.passthrough(),
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
    user: hookUserPatchGuard.passthrough().optional(),
  }),
]);

export type PostSignInResult = z.infer<typeof postSignInResultGuard>;
