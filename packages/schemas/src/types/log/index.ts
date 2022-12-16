import type { ZodType } from 'zod';
import { z } from 'zod';

import type * as interaction from './interaction.js';
import type * as token from './token.js';

export * as interaction from './interaction.js';
export * as token from './token.js';

export const LogKeyUnknown = 'Unknown';

export type LogKey = interaction.LogKey | token.LogKey | typeof LogKeyUnknown;

export enum LogResult {
  Success = 'Success',
  Error = 'Error',
}

export type LogContextPayload = {
  key: string;
  result: LogResult;
  error?: Record<string, unknown> | string;
  ip?: string;
  userAgent?: string;
  applicationId?: string;
  sessionId?: string;
};

export const logContextGuard: ZodType<LogContextPayload> = z.object({
  key: z.string(),
  result: z.nativeEnum(LogResult),
  error: z.record(z.string(), z.unknown()).or(z.string()).optional(),
  ip: z.string().optional(),
  userAgent: z.string().optional(),
  applicationId: z.string().optional(),
  sessionId: z.string().optional(),
});
