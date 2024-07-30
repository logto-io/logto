import {
  type Application,
  ApplicationSignInExperiences,
  Applications,
  type ApplicationSignInExperience,
} from '@logto/schemas';
import { type Nullable } from '@silverhand/essentials';
import { sql, type CommonQueryMethods } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const createApplicationSignInExperienceQueries = (pool: CommonQueryMethods) => {
  const insert = buildInsertIntoWithPool(pool)(ApplicationSignInExperiences, {
    returning: true,
  });

  type ApplicationSignInExperienceReturn = ApplicationSignInExperience &
    Pick<Application, 'type' | 'isThirdParty'>;

  const safeFindSignInExperienceByApplicationId = async (
    applicationId: string
  ): Promise<Nullable<ApplicationSignInExperienceReturn>> => {
    const applications = convertToIdentifiers(Applications, true);
    const { table, fields } = convertToIdentifiers(ApplicationSignInExperiences, true);

    return pool.maybeOne<ApplicationSignInExperienceReturn>(sql`
      select
        ${sql.join(Object.values(fields), sql`, `)},
        ${applications.fields.type},
        ${applications.fields.isThirdParty}
      from ${table}
      join ${applications.table} on ${fields.applicationId}=${applications.fields.id}
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
