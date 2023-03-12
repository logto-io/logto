import type { Application, User } from '../db-entries/index.js';
import type { HookEvent } from '../foundations/index.js';
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
