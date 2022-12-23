import { generateStandardId } from '@logto/core-kit';
import { createModel } from '@withtyped/server';
import { z } from 'zod';

import type { Application, User } from '../db-entries/index.js';
import type { userInfoSelectFields } from '../types/index.js';

export enum HookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

export type HookEventPayload = {
  hookId: string;
  event: HookEvent;
  createdAt: string;
  sessionId?: string;
  userAgent?: string;
  userId?: string;
  user?: Pick<User, typeof userInfoSelectFields[number]>;
  application?: Pick<Application, 'id' | 'type' | 'name' | 'description'>;
} & Record<string, unknown>;

export type HookConfig = {
  /** We don't need `type` since v1 only has web hook */
  // type: 'web';
  /** Method fixed to `POST` */
  url: string;
  /** Additional headers that attach to the request */
  headers?: Record<string, string>;
  /**
   * Retry times when hook response status >= 500.
   *
   * Must be less than or equal to `3`. Use `0` to disable retry.
   **/
  retries: number;
};

export const hookConfigGuard: z.ZodType<HookConfig> = z.object({
  url: z.string(),
  headers: z.record(z.string()).optional(),
  retries: z.number().gte(0).lte(3),
});

export const Hooks = createModel(/* sql */ `
  create table hooks (
    id varchar(32) not null,
    event varchar(128) not null,
    config jsonb /* @use HookConfig */ not null,
    created_at timestamptz not null default(now()),
    primary key (id)
  );

  create index hooks__event on hooks (event);
`)
  .extend('id', { default: () => generateStandardId(), readonly: true })
  .extend('event', z.nativeEnum(HookEvent)) // Tried to use `.refine()` to show the correct error path, but not working.
  .extend('config', hookConfigGuard);
