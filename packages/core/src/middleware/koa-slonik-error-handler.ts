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

import { SchemaLike } from '@logto/schemas';
import { Middleware } from 'koa';
import { SlonikError, NotFoundError } from 'slonik';

import RequestError from '@/errors/RequestError';
import { DeletionError, InsertionError, UpdateError } from '@/errors/SlonikError';

export default function koaSlonikErrorHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof SlonikError)) {
        throw error;
      }

      switch (error.constructor) {
        case InsertionError:
          throw new RequestError({
            code: 'entity.create_failed',
            name: (error as InsertionError<SchemaLike>).schema.tableSingular,
          });
        case UpdateError:
          throw new RequestError({
            code: 'entity.not_exists',
            name: (error as InsertionError<SchemaLike>).schema.tableSingular,
          });
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
