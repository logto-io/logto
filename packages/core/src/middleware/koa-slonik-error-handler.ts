/**
 * Slonik Error Types:
 *
 *  BackendTerminatedError,
 *  CheckIntegrityConstraintViolationError,
 *  ConnectionError,
 *  DataIntegrityError,
 *  ForeignKeyIntegrityConstraintViolationError,
 *  IntegrityConstraintViolationError,
 *  InvalidConfigurationError,
 *  InvalidInputError,
 *  NotFoundError,
 *  NotNullIntegrityConstraintViolationError,
 *  StatementCancelledError,
 *  StatementTimeoutError,
 *  UnexpectedStateError,
 *  UniqueIntegrityConstraintViolationError,
 *  TupleMovedToAnotherPartitionError
 *
 * (reference)[https://github.com/gajus/slonik#error-handling]
 */

import { Middleware } from 'koa';
import { SlonikError, NotFoundError } from 'slonik';

import RequestError from '@/errors/RequestError';
import { DeletionError } from '@/errors/SlonikError';

export default function koaSlonikHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof SlonikError)) {
        throw error;
      }

      switch (error.constructor) {
        case DeletionError:
        case NotFoundError:
          throw new RequestError({
            code: 'entity.not_found',
            status: 404,
          });
        default:
          throw error;
      }
    }
  };
}
