import { z } from 'zod';

/**
 * We categorize the hook events into two types:
 *
 * InteractionHookEvent: The hook events that are triggered by user interactions.
 * DataHookEvent: The hook events that are triggered by Logto data mutations.
 */

// InteractionHookEvent
export enum InteractionHookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

// DataHookEvent
// TODO: @simeng-li implement more data hook events
enum DataHookMutableSchema {
  Role = 'Role',
}

enum DataHookMutationType {
  Created = 'Created',
  Updated = 'Updated',
  Deleted = 'Deleted',
}
export type DataHookEvent = `${DataHookMutableSchema}.${DataHookMutationType}`;

/** The hook event values that can be registered. */
export const hookEvents = Object.freeze([
  InteractionHookEvent.PostRegister,
  InteractionHookEvent.PostSignIn,
  InteractionHookEvent.PostResetPassword,
  'Role.Created',
  'Role.Updated',
  'Role.Deleted',
] as const satisfies Array<InteractionHookEvent | DataHookEvent>);

/** The type of hook event values that can be registered. */
export type HookEvent = (typeof hookEvents)[number];

export const hookEventGuard = z.enum(hookEvents);

export const hookEventsGuard = hookEventGuard.array();

export type HookEvents = z.infer<typeof hookEventsGuard>;

/**
 * Hook configuration for web hook.
 */
export const hookConfigGuard = z.object({
  /** We don't need `type` since v1 only has web hook */
  // type: 'web';
  /** Method fixed to `POST` */
  url: z.string(),
  /** Additional headers that attach to the request */
  headers: z.record(z.string()).optional(),
  /**
   * @deprecated
   * Retry times when hook response status >= 500.
   * Now the retry times is fixed to 3.
   * Keep for backward compatibility.
   */
  retries: z.number().gte(0).lte(3).optional(),
});

export type HookConfig = z.infer<typeof hookConfigGuard>;

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Management API hooks registration.
 * Define the hook event that should be triggered when the management API is called.
 */
export const managementApiHooksRegistration = Object.freeze({
  'POST /roles': 'Role.Created',
  'PATCH /roles/:id': 'Role.Updated',
  'DELETE /roles/:id': 'Role.Deleted',
} satisfies Record<`${ApiMethod} ${string}`, DataHookEvent>);
