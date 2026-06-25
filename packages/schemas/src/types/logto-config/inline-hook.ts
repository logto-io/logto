import { jsonGuard } from '@logto/connector-kit';
import { z } from 'zod';

import type { Json } from '../../foundations/index.js';
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

export type HookUser = Pick<
  UserInfo,
  | 'id'
  | 'username'
  | 'primaryEmail'
  | 'primaryPhone'
  | 'name'
  | 'avatar'
  | 'customData'
  | 'profile'
  | 'applicationId'
  | 'isSuspended'
>;

export type HookUserPatch = Partial<Omit<HookUser, 'id'>>;

export type PostFirstFactorVerificationEvent = {
  key: LogtoInlineHookKey.PostFirstFactorVerification;
  interactionEvent: InteractionEvent.SignIn;
  identifier: InteractionIdentifier;
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
