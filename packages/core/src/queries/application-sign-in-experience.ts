import { ApplicationSignInExperiences, type ApplicationSignInExperience } from '@logto/schemas';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const createApplicationSignInExperienceQueries = (pool: CommonQueryMethods) => {
  const insert = buildInsertIntoWithPool(pool)(ApplicationSignInExperiences, {
    returning: true,
  });

  const safeFindSignInExperienceByApplicationId = async (applicationId: string) => {
    const { table, fields } = convertToIdentifiers(ApplicationSignInExperiences);

    return pool.maybeOne<ApplicationSignInExperience>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
    `);
  };

  const update = buildUpdateWhereWithPool(pool)(ApplicationSignInExperiences, true);

  const updateByApplicationId = async (
    applicationId: string,
    set: Partial<Omit<ApplicationSignInExperience, 'applicationId' | 'tenantId'>>
  ) => update({ set, where: { applicationId }, jsonbMode: 'replace' });

  return {
    insert,
    safeFindSignInExperienceByApplicationId,
    updateByApplicationId,
  };
};

export default createApplicationSignInExperienceQueries;
