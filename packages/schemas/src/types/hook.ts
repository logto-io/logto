import { z } from 'zod';

import { Hooks, type Application, type User } from '../db-entries/index.js';
import { type DataHookEvent, type InteractionHookEvent } from '../foundations/index.js';

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
  /** The application ID if the hook is triggered by interaction API. */
  applicationId?: string;
  /** The session ID if the hook is triggered by interaction API. */
  sessionId?: string;
  /** The InteractionEvent if the hook is triggered by interaction API. */
  interactionEvent: InteractionEvent;
};

type InteractionApiContextPayload = {
  /** Fetch application detail by application ID before sending the hook event */
  application?: Pick<Application, 'id' | 'type' | 'name' | 'description'>;
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

export type HookEventPayload = InteractionHookEventPayload | DataHookEventPayload;
