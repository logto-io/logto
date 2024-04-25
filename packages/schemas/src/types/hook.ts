import { z } from 'zod';

import { Hooks, type Application, type User } from '../db-entries/index.js';
import { type InteractionHookEvent, type ManagementHookEvent } from '../foundations/index.js';

import type { userInfoSelectFields } from './user.js';

export type InteractionHookEventPayload = {
  hookId: string;
  event: InteractionHookEvent;
  createdAt: string;
  sessionId?: string;
  userAgent?: string;
  userId?: string;
  userIp?: string;
  user?: Pick<User, (typeof userInfoSelectFields)[number]>;
  application?: Pick<Application, 'id' | 'type' | 'name' | 'description'>;
} & Record<string, unknown>;

export type ManagementHookEventPayload = {
  hookId: string;
  event: ManagementHookEvent;
  createdAt: string;
  ip?: string;
  userAgent?: string;
  body?: Record<string, unknown>;
  path?: string;
  status?: number;
  method?: string;
} & Record<string, unknown>;

export type HookEventPayload = InteractionHookEventPayload | ManagementHookEventPayload;

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
