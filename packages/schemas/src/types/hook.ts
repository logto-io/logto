import { z } from 'zod';

import { Hooks, type Application, type User } from '../db-entries/index.js';
import { type HookEvent } from '../foundations/index.js';

import type { userInfoSelectFields } from './user.js';

export type HookEventPayload = {
  hookId: string;
  event: HookEvent;
  createdAt: string;
  sessionId?: string;
  userAgent?: string;
  userId?: string;
  user?: Pick<User, (typeof userInfoSelectFields)[number]>;
  application?: Pick<Application, 'id' | 'type' | 'name' | 'description'>;
} & Record<string, unknown>;

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
