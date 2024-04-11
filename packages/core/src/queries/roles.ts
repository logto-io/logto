import type { CreateRole, Role, RoleType } from '@logto/schemas';
import { internalRolePrefix, SearchJointMode, Roles } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';
import { conditionalArraySql, conditionalSql, convertToIdentifiers } from '#src/utils/sql.js';
import type { OmitAutoSetFields } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(Roles);

const buildRoleConditions = (search: Search) => {
  const hasSearch = search.matches.length > 0;
  const searchFields = [Roles.fields.id, Roles.fields.name, Roles.fields.description];

  return conditionalSql(
    hasSearch,
    () => sql`and ${buildConditionsFromSearch(search, searchFields)}`
  );
};

export const defaultSearch = { matches: [], isCaseSensitive: false, joint: SearchJointMode.Or };

export const createRolesQueries = (pool: CommonQueryMethods) => {
  const countRoles = async (
    search: Search = defaultSearch,
    {
      excludeRoleIds = [],
      roleIds,
      type,
    }: { excludeRoleIds?: string[]; roleIds?: string[]; type?: RoleType } = {}
  ) => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      where (not starts_with(${fields.name}, ${internalRolePrefix}))
      ${conditionalArraySql(
        excludeRoleIds,
        (value) => sql`and ${fields.id} not in (${sql.join(value, sql`, `)})`
      )}
      ${conditionalSql(
        roleIds,
        (value) =>
          sql`and ${fields.id} in (${value.length > 0 ? sql.join(value, sql`, `) : sql`null`})`
      )}
      ${conditionalSql(type, (type) => sql`and ${fields.type}=${type}`)}
      ${buildRoleConditions(search)}
    `);

    return { count: Number(count) };
  };

  const findRoles = async (
    search: Search,
    limit?: number,
    offset?: number,
    {
      excludeRoleIds = [],
      roleIds,
      type,
    }: { excludeRoleIds?: string[]; roleIds?: string[]; type?: RoleType } = {}
  ) =>
    pool.any<Role>(
      sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where (not starts_with(${fields.name}, ${internalRolePrefix}))
        ${conditionalArraySql(
          excludeRoleIds,
          (value) => sql`and ${fields.id} not in (${sql.join(value, sql`, `)})`
        )}
        ${conditionalSql(
          roleIds,
          (value) =>
            sql`and ${fields.id} in (${value.length > 0 ? sql.join(value, sql`, `) : sql`null`})`
        )}
        ${conditionalSql(type, (type) => sql`and ${fields.type}=${type}`)}
        ${buildRoleConditions(search)}
        ${conditionalSql(limit, (value) => sql`limit ${value}`)}
        ${conditionalSql(offset, (value) => sql`offset ${value}`)}
      `
    );

  const findRolesByRoleIds = async (roleIds: string[]) =>
    roleIds.length > 0
      ? pool.any<Role>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.id} in (${sql.join(roleIds, sql`, `)})
      `)
      : [];

  const findRolesByRoleNames = async (roleNames: string[]) =>
    roleNames.length > 0
      ? pool.any<Role>(sql`
        select ${sql.join(Object.values(fields), sql`, `)}
        from ${table}
        where ${fields.name} in (${sql.join(roleNames, sql`, `)})
      `)
      : [];

  const findRoleByRoleName = async (roleName: string, excludeRoleId?: string) =>
    pool.maybeOne<Role>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} = ${roleName}
      ${conditionalSql(excludeRoleId, (id) => sql`and ${fields.id}<>${id}`)}
    `);

  const insertRoles = async (roles: CreateRole[]) =>
    pool.query(sql`
      insert into ${table} (${fields.id}, ${fields.name}, ${fields.description}) values
      ${sql.join(
        roles.map(({ id, name, description }) => sql`(${id}, ${name}, ${description})`),
        sql`, `
      )}
    `);

  const insertRole = buildInsertIntoWithPool(pool)(Roles, {
    returning: true,
  });

  const findRoleById = buildFindEntityByIdWithPool(pool)(Roles);

  const updateRole = buildUpdateWhereWithPool(pool)(Roles, true);

  const updateRoleById = async (id: string, set: Partial<OmitAutoSetFields<CreateRole>>) =>
    updateRole({ set, where: { id }, jsonbMode: 'merge' });

  const deleteRoleById = async (id: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.id}=${id}
    `);

    if (rowCount < 1) {
      throw new DeletionError(Roles.table, id);
    }
  };

  return {
    countRoles,
    findRoles,
    findRolesByRoleIds,
    findRolesByRoleNames,
    findRoleByRoleName,
    insertRoles,
    insertRole,
    findRoleById,
    updateRole,
    updateRoleById,
    deleteRoleById,
  };
};
