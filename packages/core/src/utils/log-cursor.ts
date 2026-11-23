import type { Optional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

/** Payload encoded into an opaque log cursor. */
export type LogCursor = {
  /** Exact `createdAt` text in UTC, with microsecond precision. */
  createdAt: string;
  id: string;
};

const invalidCursor = () => new RequestError({ code: 'guard.invalid_input', type: 'cursor' });

const logCursorGuard = z.object({
  // `findLogsForCursor` writes this exact format with `to_char(created_at at time zone 'UTC',
  // 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`. `offset: false` enforces the UTC `Z` suffix, `precision: 6`
  // enforces microseconds, and the refinement rejects year 0000, which the server never emits.
  createdAt: z
    .string()
    .datetime({ offset: false, precision: 6 })
    .refine((value) => !value.startsWith('0000-')),
  id: z.string().min(1),
});

/** Encode the cursor payload as base64url JSON. */
export const encodeLogCursor = ({ createdAt, id }: LogCursor) =>
  Buffer.from(JSON.stringify({ createdAt, id }), 'utf8').toString('base64url');

/**
 * Decode an opaque cursor. An omitted cursor is allowed; empty or malformed cursors throw a
 * `400` validation error.
 */
export const decodeLogCursor = (raw?: string): Optional<LogCursor> => {
  if (raw === undefined) {
    return undefined;
  }

  if (raw.trim() === '') {
    throw invalidCursor();
  }

  try {
    const decoded: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const result = logCursorGuard.safeParse(decoded);

    if (!result.success) {
      throw invalidCursor();
    }

    return result.data;
  } catch (error) {
    if (error instanceof RequestError) {
      throw error;
    }

    throw invalidCursor();
  }
};
