import type { Optional } from '@silverhand/essentials';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';

/** Payload encoded into an opaque log export cursor. */
export type LogExportCursor = {
  /** Exact `createdAt` text in UTC, with microsecond precision. */
  createdAt: string;
  id: string;
};

const invalidCursor = () => new RequestError({ code: 'guard.invalid_input', type: 'cursor' });

const logExportCursorGuard = z.object({
  // `findLogsForExport` writes this exact format with `to_char(created_at at time zone 'UTC',
  // 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')`. Zod validates the ISO-8601 shape and the calendar date.
  createdAt: z.string().datetime({ offset: true, precision: 6 }),
  id: z.string().min(1),
});

/** Encode the cursor payload as base64url JSON. */
export const encodeLogExportCursor = ({ createdAt, id }: LogExportCursor) =>
  Buffer.from(JSON.stringify({ createdAt, id }), 'utf8').toString('base64url');

/**
 * Decode an opaque cursor. An omitted cursor is allowed; empty or malformed cursors throw a
 * `400` validation error.
 */
export const decodeLogExportCursor = (raw?: string): Optional<LogExportCursor> => {
  if (raw === undefined) {
    return undefined;
  }

  if (raw.trim() === '') {
    throw invalidCursor();
  }

  try {
    const decoded: unknown = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'));
    const result = logExportCursorGuard.safeParse(decoded);

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
