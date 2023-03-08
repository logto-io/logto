import type { MiddlewareType } from 'koa';
import { DatabaseError } from 'pg-protocol';

import RequestError from '#src/errors/RequestError/index.js';

/**
 * Provide a user-friendly error message for Row Level Security errors.
 * The message is dedicated for providing a hint of internal roles update violation.
 *
 * Since it's hard to detect the specific violated policy, this function should be ONLY used
 * for roles routes.
 */
export default function koaRoleRlsErrorHandler<StateT, ContextT, ResponseBodyT>(): MiddlewareType<
  StateT,
  ContextT,
  ResponseBodyT
> {
  return async (_, next) => {
    try {
      await next();
    } catch (error: unknown) {
      // https://www.postgresql.org/docs/14/errcodes-appendix.html
      if (error instanceof DatabaseError && error.code === '42501') {
        throw new RequestError(
          { code: 'role.internal_role_violation', status: 403 },
          { original: error }
        );
      }
      throw error;
    }
  };
}
