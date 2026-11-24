import type { Resource, CreateResource } from '@logto/schemas';
import {
  managementApiIndicatorPattern,
  Resources,
  RolesScopes,
  Scopes,
  SearchJointMode,
} from '@logto/schemas';
import type { CommonQueryMethods, SqlSqlToken } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { type WellKnownCache } from '#src/caches/well-known.js';
import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError, UpdateError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';
import { conditionalArraySql, conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Resources);
const resources = convertToIdentifiers(Resources, true);
const scopes = convertToIdentifiers(Scopes, true);
const rolesScopes = convertToIdentifiers(RolesScopes, true);

const resourceSearchFields = [
  Resources.fields.id,
  Resources.fields.name,
  Resources.fields.indicator,
] as const;

const scopeSearchFields = [Scopes.fields.name] as const;

export type ResourceQueryOptions = {
  excludeManagementApis?: boolean;
  hasScopes?: boolean;
  excludeRoleId?: string;
  search?: Search;
};

const buildAssignableScopeExclusion = (excludeRoleId?: string) =>
  conditionalSql(
    excludeRoleId,
    (roleId) => sql`
      and not exists (
        select 1
        from ${rolesScopes.table}
        where ${rolesScopes.fields.roleId} = ${roleId}
        and ${rolesScopes.fields.scopeId} = ${scopes.fields.id}
      )
    `
  );

const buildResourceSearchConditions = (search: Search, excludeRoleId?: string) => {
  const conditions = search.matches.map((match) => {
    if (match.field) {
      return buildConditionsFromSearch({ ...search, matches: [match] }, resourceSearchFields);
    }

    const resourceCondition = buildConditionsFromSearch(
      { ...search, matches: [match] },
      resourceSearchFields
    );
    const scopeCondition = buildConditionsFromSearch(
      { ...search, matches: [match] },
      scopeSearchFields
    );

    return sql`(${resourceCondition} or exists (
      select 1
      from ${scopes.table}
      where ${scopes.fields.resourceId} = ${resources.fields.id}
      and ${scopeCondition}
      ${buildAssignableScopeExclusion(excludeRoleId)}
    ))`;
  });

  const jointSql = search.joint === SearchJointMode.And ? sql` and ` : sql` or `;

  return sql`(${sql.join(conditions, jointSql)})`;
};

const buildResourceConditions = ({
  excludeManagementApis,
  hasScopes,
  excludeRoleId,
  search,
}: ResourceQueryOptions = {}) => {
  const conditions: SqlSqlToken[] = [
    ...(excludeManagementApis
      ? [sql`${fields.indicator} !~ ${managementApiIndicatorPattern}`]
      : []),
    ...(hasScopes
      ? [
          sql`exists (
            select 1
            from ${scopes.table}
            where ${scopes.fields.resourceId} = ${resources.fields.id}
            ${buildAssignableScopeExclusion(excludeRoleId)}
          )`,
        ]
      : []),
    ...(search && search.matches.length > 0
      ? [buildResourceSearchConditions(search, excludeRoleId)]
      : []),
  ];

  return conditionalArraySql(conditions, (value) => sql`where ${sql.join(value, sql` and `)}`);
};

export const createResourceQueries = (pool: CommonQueryMethods, wellKnownCache: WellKnownCache) => {
  const findTotalNumberOfResources = async (options?: ResourceQueryOptions) => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      ${buildResourceConditions(options)}
    `);

    return { count: Number(count) };
  };

  const findAllResources = async (
    options?: ResourceQueryOptions,
    limit?: number,
    offset?: number
  ) =>
    pool.any<Resource>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      ${buildResourceConditions(options)}
      order by ${fields.id}
      ${conditionalSql(limit, (value) => sql`limit ${value}`)}
      ${conditionalSql(offset, (value) => sql`offset ${value}`)}
    `);

  const findResourceByIndicator = wellKnownCache.memoize(
    async (indicator: string) =>
      pool.maybeOne<Resource>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.indicator}=${indicator}
      `),
    ['resource-by-indicator', (indicator) => indicator]
  );

  const findDefaultResource = async () =>
    pool.maybeOne<Resource>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.isDefault}=true
    `);

  const setDefaultResource = async (id: string) => {
    const { previousDefaults, resource } = await pool.transaction(async (connection) => {
      const previousDefaults = await connection.any<Pick<Resource, 'indicator'>>(sql`
        update ${table}
          set ${fields.isDefault}=false
          where ${fields.isDefault}=true
          returning ${fields.indicator};
      `);
      const resource = await connection.maybeOne<Resource>(sql`
        update ${table}
          set ${fields.isDefault}=true
          where ${fields.id}=${id}
          returning *;
      `);

      if (!resource) {
        throw new UpdateError(Resources, { set: { isDefault: true }, where: { id } });
      }

      return { previousDefaults, resource };
    });

    await Promise.all(
      [...previousDefaults, resource].map(async ({ indicator }) =>
        wellKnownCache.invalidate('resource-by-indicator', indicator)
      )
    );

    return resource;
  };

  const findResourceById = buildFindEntityByIdWithPool(pool)(Resources);

  const findResourcesByIds = async (resourceIds: string[]) =>
    resourceIds.length > 0
      ? pool.any<Resource>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(resourceIds, sql`, `)})
      `)
      : [];

  const insertResource = wellKnownCache.mutate(
    buildInsertIntoWithPool(pool)(Resources, {
      returning: true,
    }),
    ['resource-by-indicator', ({ indicator }) => indicator]
  );

  const updateResource = buildUpdateWhereWithPool(pool)(Resources, true);

  const updateResourceById = async (
    id: string,
    set: Partial<OmitAutoSetFields<CreateResource>>,
    jsonbMode: 'replace' | 'merge' = 'merge'
  ) => {
    const previousResource = await findResourceById(id);
    const updatedResource = await updateResource({ set, where: { id }, jsonbMode });

    await Promise.all(
      [previousResource.indicator, updatedResource.indicator].map(async (indicator) =>
        wellKnownCache.invalidate('resource-by-indicator', indicator)
      )
    );

    return updatedResource;
  };

  const deleteResourceById = async (id: string) => {
    const { indicator } = await findResourceById(id);
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Resources.table, id);
    }

    await wellKnownCache.invalidate('resource-by-indicator', indicator);
  };

  return {
    findTotalNumberOfResources,
    findAllResources,
    findResourceByIndicator,
    findDefaultResource,
    setDefaultResource,
    findResourceById,
    findResourcesByIds,
    insertResource,
    updateResource,
    updateResourceById,
    deleteResourceById,
  };
};
