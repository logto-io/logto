import type { RolesScope } from '@logto/schemas';
import { RolesScopes } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import type { CommonQueryMethods } from 'slonik';
import { sql } from 'slonik';

import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(RolesScopes);

export const createRolesScopesQueries = (pool: CommonQueryMethods) => {
  const insertRolesScopes = async (rolesScopes: RolesScope[]) =>
    pool.query(sql`
      insert into ${table} (${fields.scopeId}, ${fields.roleId}) values
      ${sql.join(
        rolesScopes.map(({ scopeId, roleId }) => sql`(${scopeId}, ${roleId})`),
        sql`, `
      )}
    `);

  const findRolesScopesByRoleId = async (roleId: string) =>
    pool.any<RolesScope>(sql`
      select ${sql.join(Object.values(fields), sql`,`)}
      from ${table}
      where ${fields.roleId}=${roleId}
    `);

  const deleteRolesScope = async (roleId: string, scopeId: string) => {
    const { rowCount } = await pool.query(sql`
      delete from ${table}
      where ${fields.scopeId} = ${scopeId} and ${fields.roleId} = ${roleId}
    `);

    if (rowCount < 1) {
      throw new DeletionError(RolesScopes.table);
    }
  };

  return { insertRolesScopes, findRolesScopesByRoleId, deleteRolesScope };
};
