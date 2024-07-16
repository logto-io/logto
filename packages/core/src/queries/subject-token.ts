import { type CreateSubjectToken, SubjectTokens } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { type OmitAutoSetFields } from '#src/utils/sql.js';

export const createSubjectTokenQueries = (pool: CommonQueryMethods) => {
  const insertSubjectToken = buildInsertIntoWithPool(pool)(SubjectTokens, {
    returning: true,
  });

  const findSubjectToken = buildFindEntityByIdWithPool(pool)(SubjectTokens);

  const updateSubjectToken = buildUpdateWhereWithPool(pool)(SubjectTokens, true);

  const updateSubjectTokenById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateSubjectToken>>
  ) => updateSubjectToken({ set, where: { id }, jsonbMode: 'merge' });

  return {
    insertSubjectToken,
    findSubjectToken,
    updateSubjectTokenById,
  };
};
