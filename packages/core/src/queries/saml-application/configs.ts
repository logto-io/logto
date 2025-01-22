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
    /**
     * @remarks
     * Here we use the `.one()` method instead of the `.maybeOne()` method because when creating a SAML app, we directly create a corresponding SAML config record. This means that in subsequent API operations on the SAML app's config, we don't need additional checks:
     * 1. Whether to insert a SAML config (an alternative approach is not to insert a SAML config record when creating the SAML app, and use an `insert into ... on conflict` query during PATCH to achieve the same result).
     * 2. When the corresponding config for the SAML app does not exist, the GET method needs to handle the null SAML config additionally.
     * According to our design, if a SAML config record is created at the same time as the SAML app, in all subsequent scenarios, we only deal with update operations on this DB record. In our business scenario, there is no manual deletion of SAML config records.
     */
    pool.one<SamlApplicationConfig>(sql`
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
