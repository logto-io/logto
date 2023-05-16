import { boolean, object, string } from 'zod';

import { type Application, type User } from '../db-entries/index.js';
import {
  hookEventsGuard,
  type HookEvent,
  hookConfigGuard,
  hookEventGuard,
} from '../foundations/index.js';

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

export const createHookGuard = object({
  // Note: ensure the user will not create a hook with an empty name.
  name: string().min(1).optional(),
  event: hookEventGuard.optional(),
  events: hookEventsGuard.nonempty().optional(),
  config: hookConfigGuard,
  enabled: boolean().optional().default(true),
});

export const updateHookGuard = createHookGuard
  .omit({ events: true, enabled: true })
  .deepPartial()
  .extend({ events: hookEventsGuard.nonempty().optional(), enabled: boolean().optional() });
