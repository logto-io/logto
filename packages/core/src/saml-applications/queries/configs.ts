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
     * 这里我们使用了 `.one()` 方法 instead of `.maybeOne()` 方法，是因为我们在创建 SAML app 时，直接会创建一条对应的 SAML config 记录。这样在后续我们通过 API 操作 SAML app 的 config 时，不需要额外判断：
     * 1. 是否需要插入 SAML config（一个 alternative 是，在创建 SAML app 时，不插入一条 SAML config 记录，在 PATCH 时，使用 insert into ... on conflict 的 query 来达到同样的目的）
     * 2. 在 SAML app 对应的 config 不存在时，GET 方法需要对 null 的 SAML config 进行额外的处理
     * 根据我们的设计，如果在创建 SAML app 时，就同时创建一条 SAML config 记录，在之后的所有场景中，我们只涉及对这条 DB 记录的 update 操作。在我们的业务场景中，没有手动对 SAML config 记录的 delete 操作。
     *
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
