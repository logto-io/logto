import type { Application, CreateApplication } from '@logto/schemas';
import {
  ApplicationType,
  Applications,
  OrganizationApplicationRelations,
  SearchJointMode,
} from '@logto/schemas';
import { condArray, pick } from '@silverhand/essentials';
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
const organizationApplicationRelations = convertToIdentifiers(OrganizationApplicationRelations);

/**
 * The schema field keys that can be used for searching apps. For the actual field names,
 * see {@link Applications.fields} and {@link applicationSearchFields}.
 */
export const applicationSearchKeys = Object.freeze(['id', 'name', 'description'] satisfies Array<
  keyof Application
>);

/**
 * The actual database field names that can be used for searching apps. For the schema field
 * keys, see {@link applicationSearchKeys}.
 */
const applicationSearchFields = Object.freeze(
  Object.values(pick(Applications.fields, ...applicationSearchKeys))
);

const buildApplicationSearchConditions = (search: Search) => {
  return conditionalSql(
    search.matches.length > 0,
    () =>
      /**
       * Avoid specifying the DB column type when calling the API (which is meaningless).
       * Should specify the DB column type of enum type.
       */
      sql`${buildConditionsFromSearch(search, applicationSearchFields)}`
  );
};

const buildConditionArray = (conditions: SqlSqlToken[]) => {
  const filteredConditions = conditions.filter((condition) => condition.sql.trim() !== '');
  return conditionalArraySql(
    filteredConditions,
    (filteredConditions) => sql`where ${sql.join(filteredConditions, sql` and `)}`
  );
};

type ApplicationConditions = {
  /** The search config object, can apply to fields in {@link applicationSearchFields}. */
  search: Search;
  /** Exclude applications with these ids. */
  excludeApplicationIds?: string[];
  /** Exclude applications associated with an organization. */
  excludeOrganizationId?: string;
  /** Filter applications by types, if not provided, all types will be included. */
  types?: ApplicationType[];
  /** Filter applications by whether it is a third party application. */
  isThirdParty?: boolean;
};

const buildApplicationConditions = ({
  search,
  excludeApplicationIds,
  excludeOrganizationId,
  types,
  isThirdParty,
}: ApplicationConditions) => {
  return buildConditionArray(
    condArray(
      excludeApplicationIds?.length &&
        sql`${fields.id} not in (${sql.join(excludeApplicationIds, sql`, `)})`,
      excludeOrganizationId &&
        sql`
      not exists (
        select 1 from ${organizationApplicationRelations.table}
        where ${organizationApplicationRelations.fields.applicationId} = ${fields.id}
        and ${organizationApplicationRelations.fields.organizationId}=${excludeOrganizationId}
      )`,
      types?.length && sql`${fields.type} in (${sql.join(types, sql`, `)})`,
      typeof isThirdParty === 'boolean' && sql`${fields.isThirdParty} = ${isThirdParty}`,
      buildApplicationSearchConditions(search)
    )
  );
};

export const createApplicationQueries = (pool: CommonQueryMethods) => {
  /**
   * Get the number of applications that match the search conditions, conditions are joined in `and` mode.
   */
  const countApplications = async (conditions: ApplicationConditions) => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      ${buildApplicationConditions(conditions)}
    `);

    return { count: Number(count) };
  };

  /**
   * Get the list of applications that match the search conditions, conditions are joined in `and` mode.
   */
  const findApplications = async (
    conditions: ApplicationConditions,
    pagination?: { limit: number; offset: number }
  ) =>
    pool.any<Application>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${buildApplicationConditions(conditions)}
      order by ${fields.createdAt} desc
      ${conditionalSql(pagination, ({ limit, offset }) => sql`limit ${limit} offset ${offset}`)}
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
    countApplications({
      search: {
        matches: [],
        joint: SearchJointMode.And, // Dummy since there is no match
        isCaseSensitive: false, // Dummy since there is no match
      },
    });

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
        buildApplicationSearchConditions(search),
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
        buildApplicationSearchConditions(search),
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
