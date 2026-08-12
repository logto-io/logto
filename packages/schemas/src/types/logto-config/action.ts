import { jsonGuard } from '@logto/connector-kit';
import { z } from 'zod';

import type { Json } from '../../foundations/index.js';
import { type ToZodObject } from '../../utils/zod.js';
import {
  InteractionEvent,
  interactionIdentifierGuard,
  type InteractionIdentifier,
} from '../interactions.js';
import { userInfoGuard, type UserInfo } from '../user.js';
import { VerificationType } from '../verification-records/index.js';

import type { JwtCustomizerUserContext } from './jwt-customizer.js';

/** Values map to config key names in `logto_configs`. */
export enum LogtoActionKey {
  PostFirstFactorVerification = 'action.postFirstFactorVerification',
  PostSignIn = 'action.postSignIn',
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

export const actionUserPatchFields = Object.freeze(actionUserPatchGuard.keyof().options);

/**
 * The subset of {@link PostFirstFactorVerificationEvent} that is safe to persist in audit logs.
 *
 * The end user's password is the only credential in the event that the tenant does not already own,
 * so it is dropped rather than masked. The user object collapses to its ID because the audit log
 * records the same ID as a top-level `userId`.
 */
export type LoggablePostFirstFactorVerificationEvent = Omit<
  PostFirstFactorVerificationEvent,
  'password' | 'user'
> & {
  user: Pick<ActionUser, 'id'> | null;
};

export const loggablePostFirstFactorVerificationEventGuard = z.object({
  key: z.literal(LogtoActionKey.PostFirstFactorVerification),
  interactionEvent: z.literal(InteractionEvent.SignIn),
  verificationType: z.literal(VerificationType.Password),
  identifier: interactionIdentifierGuard,
  user: z.object({ id: z.string() }).nullable(),
}) satisfies ToZodObject<LoggablePostFirstFactorVerificationEvent>;

/**
 * The subset of {@link PostSignInEvent} that is safe to persist in audit logs. The full
 * {@link JwtCustomizerUserContext} carries the user's identifiers, SSO identities, MFA factors,
 * roles, and organizations, none of which the audit log needs to describe the action run.
 */
export type LoggablePostSignInEvent = Omit<PostSignInEvent, 'user'> & {
  user: Pick<JwtCustomizerUserContext, 'id'>;
};

export const loggablePostSignInEventGuard = z.object({
  key: z.literal(LogtoActionKey.PostSignIn),
  interactionEvent: z.literal(InteractionEvent.SignIn),
  user: z.object({ id: z.string() }),
}) satisfies ToZodObject<LoggablePostSignInEvent>;

export type LoggableActionEvent =
  | LoggablePostFirstFactorVerificationEvent
  | LoggablePostSignInEvent;

/**
 * The audit-log description of what a script asked Logto to do. Action results are authored by
 * untrusted scripts, so this reports the shape of the requested user patch instead of its values,
 * and names only fields on the {@link actionUserPatchFields} allowlist.
 */
export type LoggableActionResult = {
  passwordVerified: boolean;
  userFields: Array<keyof ActionUserPatch>;
  unknownFieldCount: number;
};
