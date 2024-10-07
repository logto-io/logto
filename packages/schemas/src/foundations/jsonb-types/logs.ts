import { type PasswordPolicy, passwordPolicyGuard } from '@logto/core-kit';
import { type DeepPartial } from '@silverhand/essentials';
import { z } from 'zod';

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

export const logContextPayloadGuard = z
  .object({
    key: z.string(),
    result: z.nativeEnum(LogResult),
    error: z.record(z.string(), z.unknown()).or(z.string()).optional(),
    ip: z.string().optional(),
    userAgent: z.string().optional(),
    userId: z.string().optional(),
    applicationId: z.string().optional(),
    sessionId: z.string().optional(),
    params: z.record(z.string(), z.unknown()).optional(),
  })
  .catchall(z.unknown());

export type PartialPasswordPolicy = DeepPartial<PasswordPolicy>;

export const partialPasswordPolicyGuard = passwordPolicyGuard.deepPartial();

/**
 * The basic log context type. It's more about a type hint instead of forcing the log shape.
 *
 * Note when setting up a log function, the type of log key in function arguments should be `LogKey`.
 * Here we use `string` to make it compatible with the Zod guard.
 **/
export type LogContextPayload = z.infer<typeof logContextPayloadGuard>;
