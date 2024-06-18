import { SubjectTokens } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';

export const createSubjectTokenQueries = (pool: CommonQueryMethods) => {
  const insertSubjectToken = buildInsertIntoWithPool(pool)(SubjectTokens, {
    returning: true,
  });

  return {
    insertSubjectToken,
  };
};
