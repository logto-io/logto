import type { Application, CreateApplication } from '@logto/schemas';
import { ApplicationType, Applications, SearchJointMode } from '@logto/schemas';
import type { CommonQueryMethods, SqlSqlToken } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { getTotalRowCountWithPool } from '#src/database/row-count.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';
import type { Search } from '#src/utils/search.js';
import { convertToIdentifiers, conditionalSql, conditionalArraySql } from '#src/utils/sql.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';

import ApplicationUserConsentOrganizationsQuery from './application-user-consent-organizations.js';
import {
  ApplicationUserConsentOrganizationResourceScopeQueries,
  ApplicationUserConsentOrganizationScopeQueries,
  ApplicationUserConsentResourceScopeQueries,
  createApplicationUserConsentUserScopeQueries,
} from './application-user-consent-scopes.js';

const { table, fields } = convertToIdentifiers(Applications);

const buildApplicationConditions = (search: Search) => {
  const hasSearch = search.matches.length > 0;
  const searchFields = [
    Applications.fields.id,
    Applications.fields.name,
    Applications.fields.description,
  ];

  return conditionalSql(
    hasSearch,
    () =>
      /**
       * Avoid specifying the DB column type when calling the API (which is meaningless).
       * Should specify the DB column type of enum type.
       */
      sql`${buildConditionsFromSearch(search, searchFields)}`
  );
};

const buildConditionArray = (conditions: SqlSqlToken[]) => {
  const filteredConditions = conditions.filter((condition) => condition.sql !== '');
  return conditionalArraySql(
    filteredConditions,
    (filteredConditions) => sql`where ${sql.join(filteredConditions, sql` and `)}`
  );
};

export const createApplicationQueries = (pool: CommonQueryMethods) => {
  /**
   * Get the number of applications that match the search conditions, conditions are joined in `and` mode.
   *
   * @param search The search config object, can apply to `id`, `name` and `description` field for application.
   * @param excludeApplicationIds Exclude applications with these ids.
   * @param isThirdParty Optional boolean, filter applications by whether it is a third party application.
   * @param types Optional array of {@link ApplicationType}, filter applications by types, if not provided, all types will be included.
   * @returns A Promise that resolves the number of applications that match the search conditions.
   */
  const countApplications = async (
    search: Search,
    excludeApplicationIds: string[],
    isThirdParty?: boolean,
    types?: ApplicationType[]
  ) => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      ${buildConditionArray([
        excludeApplicationIds.length > 0
          ? sql`${fields.id} not in (${sql.join(excludeApplicationIds, sql`, `)})`
          : sql``,
        types && types.length > 0 ? sql`${fields.type} in (${sql.join(types, sql`, `)})` : sql``,
        typeof isThirdParty === 'boolean' ? sql`${fields.isThirdParty} = ${isThirdParty}` : sql``,
        buildApplicationConditions(search),
      ])}
    `);

    return { count: Number(count) };
  };

  /**
   * Get the list of applications that match the search conditions, conditions are joined in `and` mode.
   *
   * @param conditions The conditions to filter applications.
   * @param conditions.search The search config object, can apply to `id`, `name` and `description` field for application
   * @param conditions.excludeApplicationIds Exclude applications with these ids.
   * @param conditions.types Optional array of {@link ApplicationType}, filter applications by types, if not provided, all types will be included.
   * @param conditions.isThirdParty Optional boolean, filter applications by whether it is a third party application.
   * @param conditions.pagination Optional pagination config object.
   * @param conditions.pagination.limit The number of applications to return.
   * @param conditions.pagination.offset The offset of applications to return.
   * @returns A Promise that resolves the list of applications that match the search conditions.
   */
  const findApplications = async ({
    search,
    excludeApplicationIds,
    types,
    isThirdParty,
    pagination,
  }: {
    search: Search;
    excludeApplicationIds: string[];
    types?: ApplicationType[];
    isThirdParty?: boolean;
    pagination?: {
      limit: number;
      offset: number;
    };
  }) =>
    pool.any<Application>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${buildConditionArray([
        excludeApplicationIds.length > 0
          ? sql`${fields.id} not in (${sql.join(excludeApplicationIds, sql`, `)})`
          : sql``,
        types && types.length > 0 ? sql`${fields.type} in (${sql.join(types, sql`, `)})` : sql``,
        typeof isThirdParty === 'boolean' ? sql`${fields.isThirdParty} = ${isThirdParty}` : sql``,
        buildApplicationConditions(search),
      ])}
      order by ${fields.createdAt} desc
      ${conditionalSql(pagination?.limit, (value) => sql`limit ${value}`)}
      ${conditionalSql(pagination?.offset, (value) => sql`offset ${value}`)}
    `);

  const findTotalNumberOfApplications = async () => getTotalRowCountWithPool(pool)(table);

  const findApplicationById = buildFindEntityByIdWithPool(pool)(Applications);

  const insertApplication = buildInsertIntoWithPool(pool)(Applications, {
    returning: true,
  });

  const updateApplication = buildUpdateWhereWithPool(pool)(Applications, true);

  const updateApplicationById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateApplication>>
  ) => updateApplication({ set, where: { id }, jsonbMode: 'merge' });

  const countAllApplications = async () =>
    countApplications(
      {
        matches: [],
        joint: SearchJointMode.And, // Dummy since there is no match
        isCaseSensitive: false, // Dummy since there is no match
      },
      []
    );

  const countM2mApplications = async () => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      where ${fields.type} = ${ApplicationType.MachineToMachine}
    `);

    return { count: Number(count) };
  };

  const countThirdPartyApplications = async () => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      where ${fields.isThirdParty} = true
    `);

    return { count: Number(count) };
  };

  const countM2mApplicationsByIds = async (search: Search, applicationIds: string[]) => {
    if (applicationIds.length === 0) {
      return { count: 0 };
    }

    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      ${buildConditionArray([
        sql`${fields.type} = ${ApplicationType.MachineToMachine}`,
        sql`${fields.id} in (${sql.join(applicationIds, sql`, `)})`,
        buildApplicationConditions(search),
      ])}
    `);

    return { count: Number(count) };
  };

  const findM2mApplicationsByIds = async (
    search: Search,
    limit: number,
    offset: number,
    applicationIds: string[]
  ) => {
    if (applicationIds.length === 0) {
      return [];
    }

    return pool.any<Application>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${buildConditionArray([
        sql`${fields.type} = ${ApplicationType.MachineToMachine}`,
        sql`${fields.id} in (${sql.join(applicationIds, sql`, `)})`,
        buildApplicationConditions(search),
      ])}
      limit ${limit}
      offset ${offset}
    `);
  };

  const findApplicationsByIds = async (
    applicationIds: string[]
  ): Promise<readonly Application[]> => {
    if (applicationIds.length === 0) {
      return [];
    }
    return pool.any<Application>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(applicationIds, sql`, `)})
    `);
  };

  const deleteApplicationById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Applications.table, id);
    }
  };

  return {
    countApplications,
    countThirdPartyApplications,
    findApplications,
    findTotalNumberOfApplications,
    findApplicationById,
    insertApplication,
    updateApplication,
    updateApplicationById,
    countAllApplications,
    countM2mApplications,
    countM2mApplicationsByIds,
    findM2mApplicationsByIds,
    findApplicationsByIds,
    deleteApplicationById,
    userConsentOrganizationScopes: new ApplicationUserConsentOrganizationScopeQueries(pool),
    userConsentResourceScopes: new ApplicationUserConsentResourceScopeQueries(pool),
    userConsentOrganizationResourceScopes:
      new ApplicationUserConsentOrganizationResourceScopeQueries(pool),
    userConsentUserScopes: createApplicationUserConsentUserScopeQueries(pool),
    userConsentOrganizations: new ApplicationUserConsentOrganizationsQuery(pool),
  };
};
