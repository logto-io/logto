import { type SamlApplicationConfig, SamlApplicationConfigs } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(SamlApplicationConfigs);

export const createSamlApplicationConfigQueries = (pool: CommonQueryMethods) => {
  const insertSamlApplicationConfig = buildInsertIntoWithPool(pool)(SamlApplicationConfigs, {
    returning: true,
  });

  const updateSamlApplicationConfig = buildUpdateWhereWithPool(pool)(SamlApplicationConfigs, true);

  const findSamlApplicationConfigByApplicationId = async (applicationId: string) =>
    pool.maybeOne<SamlApplicationConfig>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.applicationId}=${applicationId}
    `);

  return {
    insertSamlApplicationConfig,
    updateSamlApplicationConfig,
    findSamlApplicationConfigByApplicationId,
  };
};
