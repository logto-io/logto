import type { SchemaLike } from '@logto/schemas';
import {
  SlonikError,
  NotFoundError,
  InvalidInputError,
  CheckIntegrityConstraintViolationError,
  UniqueIntegrityConstraintViolationError,
  ForeignKeyIntegrityConstraintViolationError,
} from '@silverhand/slonik';
import type { Middleware } from 'koa';
import { DatabaseError } from 'pg-protocol';

import RequestError from '#src/errors/RequestError/index.js';
import { DeletionError, InsertionError, UpdateError } from '#src/errors/SlonikError/index.js';

/**
 * @remarks
 * We are now upgrading this error handler to handle both SlonikError and DatabaseError.
 * This is because DatabaseError and SlonikError, due to their different sources of definition, are not unified.
 * However, in practice, both are errors triggered by DB query failures.
 */
/* eslint-disable complexity */
export default function koaSlonikErrorHandler<StateT, ContextT>(): Middleware<StateT, ContextT> {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error: unknown) {
      if (!(error instanceof SlonikError) && !(error instanceof DatabaseError)) {
        throw error;
      }

      if (error instanceof DatabaseError) {
        // https://www.postgresql.org/docs/14/errcodes-appendix.html
        // Can better infer SlonikError type.
        // eslint-disable-next-line unicorn/no-lonely-if
        if (error.code === '22001') {
          throw new RequestError(
            {
              code: 'entity.value_too_long',
              status: 422,
            },
            {
              message: error.message,
            }
          );
        }
      }

      if (error instanceof InvalidInputError) {
        throw new RequestError({
          code: 'entity.invalid_input',
          status: 422,
        });
      }

      if (error instanceof UniqueIntegrityConstraintViolationError) {
        if (error.constraint === 'applications__protected_app_metadata_host') {
          throw new RequestError({
            code: 'application.protected_application_subdomain_exists',
            status: 422,
          });
        }

        if (error.constraint === 'applications__protected_app_metadata_custom_domain') {
          throw new RequestError({
            code: 'domain.hostname_already_exists',
            status: 422,
          });
        }

        if (error.constraint === 'application_secrets_pkey') {
          throw new RequestError({
            code: 'application.secret_name_exists',
            status: 422,
          });
        }

        if (error.constraint === 'personal_access_tokens_pkey') {
          throw new RequestError({
            code: 'user.personal_access_token_name_exists',
            status: 422,
          });
        }

        if (error.constraint === 'users__username') {
          throw new RequestError({
            code: 'user.username_already_in_use',
            status: 422,
          });
        }

        if (error.constraint === 'users__primary_email') {
          throw new RequestError({
            code: 'user.email_already_in_use',
            status: 422,
          });
        }

        if (error.constraint === 'users__primary_phone') {
          throw new RequestError({
            code: 'user.phone_already_in_use',
            status: 422,
          });
        }

        if (error.constraint === 'custom_profile_fields__name') {
          throw new RequestError({
            code: 'custom_profile_fields.name_exists',
            status: 422,
          });
        }
      }

      if (error instanceof CheckIntegrityConstraintViolationError) {
        throw new RequestError({
          code: 'entity.db_constraint_violated',
          status: 422,
        });
      }

      if (error instanceof ForeignKeyIntegrityConstraintViolationError) {
        throw new RequestError({
          code: 'entity.relation_foreign_key_not_found',
          status: 404,
        });
      }

      if (error instanceof InsertionError) {
        throw new RequestError({
          code: 'entity.create_failed',
          status: 422,
          // eslint-disable-next-line no-restricted-syntax -- assert generic type of the Class instance
          name: (error as InsertionError<string, SchemaLike<string>, SchemaLike<string>>).schema
            .tableSingular,
        });
      }

      if (error instanceof UpdateError) {
        throw new RequestError({
          code: 'entity.not_exists',
          status: 404,
          name:
            // eslint-disable-next-line no-restricted-syntax -- assert generic type of the Class instance
            (error as UpdateError<string, SchemaLike<string>, SchemaLike<string>, string, string>)
              .schema.tableSingular,
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
/* eslint-enable complexity */
