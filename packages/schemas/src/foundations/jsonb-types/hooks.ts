import { z } from 'zod';

export enum InteractionHookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

enum HookMutableTarget {
  Role = 'Role',
  Scope = 'Scope',
}

enum HookMutationType {
  Created = 'Created',
  Updated = 'Updated',
  Deleted = 'Deleted',
}

export type ManagementHookEvent = `${HookMutableTarget}.${HookMutationType}`;

/** The hook event values that can be registered. */
export const hookEvents = Object.freeze([
  InteractionHookEvent.PostRegister,
  InteractionHookEvent.PostSignIn,
  InteractionHookEvent.PostResetPassword,
  'Role.Created',
  'Role.Updated',
  'Role.Deleted',
  'Scope.Created',
  'Scope.Updated',
  'Scope.Deleted',
] as const satisfies Array<InteractionHookEvent | ManagementHookEvent>);

/** The type of hook event values that can be registered. */
export type HookEvent = (typeof hookEvents)[number];

export const hookEventGuard = z.enum(hookEvents);

export const hookEventsGuard = hookEventGuard.array();

export type HookEvents = z.infer<typeof hookEventsGuard>;

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

/** Pre registered management API hooks */
type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
type ManagementApiHookKey = `${ApiMethod} ${string}`;

export const managementApiHooksRegistration = Object.freeze({
  'POST /roles': 'Role.Created',
  'PATCH /roles/:id': 'Role.Updated',
  'DELETE /roles/:id': 'Role.Deleted',
} satisfies Record<ManagementApiHookKey, ManagementHookEvent>);
