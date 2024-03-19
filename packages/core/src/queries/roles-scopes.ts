import type { CreateRolesScope, RolesScope } from '@logto/schemas';
import { RolesScopes } from '@logto/schemas';
import type { CommonQueryMethods } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import { DeletionError } from '#src/errors/SlonikError/index.js';
import { convertToIdentifiers } from '#src/utils/sql.js';

const { table, fields } = convertToIdentifiers(RolesScopes);

export const createRolesScopesQueries = (pool: CommonQueryMethods) => {
  const insertRolesScopes = async (rolesScopes: CreateRolesScope[]) =>
    pool.query(sql`
      insert into ${table} (${fields.id}, ${fields.scopeId}, ${fields.roleId}) values
      ${sql.join(
        rolesScopes.map(({ id, scopeId, roleId }) => sql`(${id}, ${scopeId}, ${roleId})`),
        sql`, `
      )}
    `);

  const countRolesScopesByRoleId = async (roleId: string) => {
    const { count } = await pool.one<{ count: string }>(sql`
      select count(*)
      from ${table}
      where ${fields.roleId}=${roleId}
    `);

    return { count: Number(count) };
  };

  const findRolesScopesByRoleId = async (roleId: string) =>
    pool.any<RolesScope>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.roleId}=${roleId}
    `);

  const findRolesScopesByRoleIds = async (roleIds: string[]) =>
    roleIds.length > 0
      ? pool.any<RolesScope>(sql`
        select ${sql.join(Object.values(fields), sql`,`)}
        from ${table}
        where ${fields.roleId} in (${sql.join(roleIds, sql`, `)})
      `)
      : [];

  const deleteRolesScope = async (roleId: string, scopeId: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.scopeId} = ${scopeId} and ${fields.roleId} = ${roleId}
    `);

    if (rowCount < 1) {
      throw new DeletionError(RolesScopes.table);
    }
  };

  return {
    insertRolesScopes,
    findRolesScopesByRoleId,
    findRolesScopesByRoleIds,
    deleteRolesScope,
    countRolesScopesByRoleId,
  };
};
