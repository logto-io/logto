import { z } from 'zod';

import { Hooks, type Application, type User } from '../db-entries/index.js';
import {
  type ExceptionHookEvent,
  type DataHookEvent,
  type InteractionHookEvent,
} from '../foundations/index.js';

import { type InteractionEvent } from './interactions.js';
import { type userInfoSelectFields } from './user.js';

const hookExecutionStatsGuard = z.object({
  successCount: z.number(),
  requestCount: z.number(),
});

export type HookExecutionStats = z.infer<typeof hookExecutionStatsGuard>;

export const hookResponseGuard = Hooks.guard.extend({
  executionStats: hookExecutionStatsGuard,
});

export type HookResponse = z.infer<typeof hookResponseGuard>;

export const hookTestErrorResponseDataGuard = z.object({
  responseStatus: z.number(),
  responseBody: z.string(),
});

export type HookTestErrorResponseData = z.infer<typeof hookTestErrorResponseDataGuard>;

/**
 * The interaction API context for triggering InteractionHook and DataHook events.
 * In the `koaInteractionHooks` middleware,
 * we will store the context before processing the interaction and consume it after the interaction is processed if needed.
 */
export type InteractionApiMetadata = {
  /** The registered application ID if the hook is triggered by interaction API. */
  applicationId?: string;
  /**
   * The CIMD client identifier URL, kept apart from `applicationId` so payload consumers
   * branch on key presence instead of URL shape.
   */
  cimdClientId?: string;
  /** The session ID if the hook is triggered by interaction API. */
  sessionId?: string;
  /** The InteractionEvent if the hook is triggered by interaction API. */
  interactionEvent: InteractionEvent;
};

type InteractionApiContextPayload = {
  /** Fetch application detail by application ID before sending the hook event */
  application?: Pick<Application, 'id' | 'type' | 'name' | 'description'>;
  /** CIMD clients are unregistered, so the identifier URL stands in for `application`. */
  cimdClientId?: string;
  sessionId?: string;
  interactionEvent?: InteractionEvent;
};

export type InteractionHookEventPayload = {
  event: InteractionHookEvent;
  createdAt: string;
  hookId: string;
  userAgent?: string;
  userIp?: string;
  /** InteractionHook result */
  userId?: string;
  /** Fetch user detail by user ID before sending the hook event */
  user?: Pick<User, (typeof userInfoSelectFields)[number]>;
} & InteractionApiContextPayload &
  Record<string, unknown>;

/**
 * The API context for management API triggered data hooks.
 * In the `koaManagementApiHooks` middleware,
 * we will store the context of management API requests that triggers the DataHook events.
 * Can't put it in the DataHookMetadata because the matched API context is only available after the request is processed.
 */
export type ManagementApiContext = {
  /** Request route params. */
  params?: Record<string, string>;
  /** Request route path. */
  path: string;
  /** Matched route used as the identifier to trigger the hook. */
  matchedRoute?: string;
  /** Request method. */
  method: string;
  /** Response status code. */
  status: number;
};

export type DataHookEventPayload = {
  event: DataHookEvent;
  createdAt: string;
  hookId: string;
  ip?: string;
  userAgent?: string;
  data?: unknown;
} & Partial<InteractionApiContextPayload> &
  Partial<ManagementApiContext> &
  Record<string, unknown>;

/**
 * A key-remapping omit instead of the built-in `Omit`: on a type carrying a string index
 * signature (e.g. the hook event payloads), `Omit` collapses every named property into
 * `unknown`; the homomorphic form keeps the named properties typed.
 */
export type BetterOmit<T, Ignore> = {
  [key in keyof T as key extends Ignore ? never : key]: T[key];
};

export type ExceptionHookEventPayload = BetterOmit<DataHookEventPayload, 'event'> & {
  event: ExceptionHookEvent;
};
export type GrantLimitExceededEventData = {
  userId: string;
  /** The registered application ID; absent for a CIMD client. */
  applicationId?: string;
  /**
   * The CIMD client identifier URL, set instead of `applicationId`. No grant-ceiling source
   * exists for CIMD clients today (the CIMD policy denies Logto private client metadata
   * regardless of source), so this key is defensive: it keeps `applicationId` registered-only
   * by construction should a ceiling for CIMD clients ever be introduced.
   */
  cimdClientId?: string;
  revokedGrantIds: string[];
  maxAllowedGrants: number;
  preRevocationActiveGrantCount: number;
};

export type HookEventPayload =
  | InteractionHookEventPayload
  | DataHookEventPayload
  | ExceptionHookEventPayload;
