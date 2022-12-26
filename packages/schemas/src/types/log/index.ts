import type { ZodType } from 'zod';
import { z } from 'zod';

import type * as hook from './hook.js';
import type * as interaction from './interaction.js';
import type * as token from './token.js';

export * as interaction from './interaction.js';
export * as token from './token.js';
export * as hook from './hook.js';

/** Fallback for empty or unrecognized log keys. */
export const LogKeyUnknown = 'Unknown';

/**
 * The union type of all available log keys.
 * Note duplicate keys are allowed but should be avoided.
 *
 * @see {@link interaction.LogKey} for interaction log keys.
 * @see {@link token.LogKey} for token log keys.
 **/
export type LogKey = typeof LogKeyUnknown | interaction.LogKey | token.LogKey | hook.LogKey;

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

/**
 * The basic log context type. It's more about a type hint instead of forcing the log shape.
 *
 * Note when setting up a log function, the type of log key in function arguments should be `LogKey`.
 * Here we use `string` to make it compatible with the Zod guard.
 **/
export type LogContextPayload = {
  key: string;
  result: LogResult;
  error?: Record<string, unknown> | string;
  ip?: string;
  userAgent?: string;
  applicationId?: string;
  sessionId?: string;
};

/** Type guard for {@link LogContextPayload} */
export const logContextGuard: ZodType<LogContextPayload> = z.object({
  key: z.string(),
  result: z.nativeEnum(LogResult),
  error: z.record(z.string(), z.unknown()).or(z.string()).optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  applicationId: z.string().optional(),
  sessionId: z.string().optional(),
});
