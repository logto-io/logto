import type { CreateRole, Role } from '@logto/schemas';
import { SearchJointMode, Roles } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { buildFindEntityByIdWithPool } from '#src/database/find-entity-by-id.js';
import { buildInsertIntoWithPool } from '#src/database/insert-into.js';
import { buildUpdateWhereWithPool } from '#src/database/update-where.js';
import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';
import type { Search } from '#src/utils/search.js';
import { buildConditionsFromSearch } from '#src/utils/search.js';

const { table, fields } = convertToIdentifiers(Roles);

const buildRoleConditions = (search: Search) => {
  const hasSearch = search.matches.length > 0;
  const searchFields = [Roles.fields.id, Roles.fields.name, Roles.fields.description];

  return conditionalSql(
    hasSearch,
    () => sql`where ${buildConditionsFromSearch(search, searchFields)}`
  );
};

export const defaultUserSearch = { matches: [], isCaseSensitive: false, joint: SearchJointMode.Or };

export const createRolesQueries = (pool: CommonQueryMethods) => {
  const countRoles = async (search: Search = defaultUserSearch) =>
    pool.one<{ count: number }>(sql`
      select count(*)
      from ${table}
      ${buildRoleConditions(search)}
    `);

  const findRoles = async (search: Search, limit?: number, offset?: number) =>
    pool.any<Role>(
      sql`
        select ${sql.join(
          Object.values(fields).map((field) => sql`${table}.${field}`),
          sql`,`
        )}
        from ${table}
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

  const insertRoles = async (roles: Role[]) =>
    pool.query(sql`
      insert into ${table} (${fields.id}, ${fields.name}, ${fields.description}) values
      ${sql.join(
        roles.map(({ id, name, description }) => sql`(${id}, ${name}, ${description})`),
        sql`, `
      )}
    `);

  const insertRole = buildInsertIntoWithPool(pool)<CreateRole, Role>(Roles, {
    returning: true,
  });

  const findRoleById = buildFindEntityByIdWithPool(pool)<CreateRole, Role>(Roles);

  const updateRole = buildUpdateWhereWithPool(pool)<CreateRole, Role>(Roles, true);

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

/** @deprecated Will be removed soon. Use createRolesQueries() factory instead. */
export const {
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
} = createRolesQueries(envSet.pool);
