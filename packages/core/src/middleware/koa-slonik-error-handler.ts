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
import { DatabaseError } from 'pg';
import { SlonikError, NotFoundError } from 'slonik';

import RequestError from '@/errors/RequestError';
import { DeletionError, InsertionError, UpdateError } from '@/errors/SlonikError';

export default function koaSlonikErrorHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (error instanceof DatabaseError) {
        throw new RequestError('entity.database_manipulation_failed', error.message);
      }

      if (!(error instanceof SlonikError)) {
        throw error;
      }

      if (error instanceof InsertionError) {
        throw new RequestError({
          code: 'entity.create_failed',
          // Assert generic type of the Class instance
          // eslint-disable-next-line no-restricted-syntax
          name: (error as InsertionError<SchemaLike>).schema.tableSingular,
        });
      }

      if (error instanceof UpdateError) {
        throw new RequestError({
          code: 'entity.not_exists',
          // Assert generic type of the Class instance
          // eslint-disable-next-line no-restricted-syntax
          name: (error as UpdateError<SchemaLike>).schema.tableSingular,
        });
      }

      if (error instanceof DeletionError || error instanceof NotFoundError) {
        throw new RequestError({
          code: 'entity.not_found',
          status: 404,
        });
      }

      throw error;
    }
  };
}
