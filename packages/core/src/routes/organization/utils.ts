import {
  ForeignKeyIntegrityConstraintViolationError,
  UniqueIntegrityConstraintViolationError,
} from '@silverhand/slonik';

import RequestError from '#src/errors/RequestError/index.js';

export const errorHandler = (error: unknown) => {
  if (error instanceof UniqueIntegrityConstraintViolationError) {
    throw new RequestError({ code: 'entity.unique_integrity_violation', status: 422 });
  }

  if (error instanceof ForeignKeyIntegrityConstraintViolationError) {
    throw new RequestError({ code: 'entity.relation_foreign_key_not_found', status: 422 });
  }

  throw error;
};
