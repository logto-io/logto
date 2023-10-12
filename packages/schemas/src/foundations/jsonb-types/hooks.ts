import { z } from 'zod';

export enum HookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

export const hookEventGuard: z.ZodType<HookEvent> = z.nativeEnum(HookEvent);

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
