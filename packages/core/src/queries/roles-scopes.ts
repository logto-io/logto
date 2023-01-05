import type { RolesScope } from '@logto/schemas';
import { RolesScopes } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import envSet from '#src/env-set/index.js';
import { DeletionError } from '#src/errors/SlonikError/index.js';

const { table, fields } = convertToIdentifiers(RolesScopes);

export const insertRolesScopes = async (rolesScopes: RolesScope[]) =>
  envSet.pool.query(sql`
    insert into ${table} (${fields.scopeId}, ${fields.roleId}) values
    ${sql.join(
      rolesScopes.map(({ scopeId, roleId }) => sql`(${scopeId}, ${roleId})`),
      sql`, `
    )}
  `);

export const findRolesScopesByRoleId = async (roleId: string) =>
  envSet.pool.any<RolesScope>(sql`
    select ${sql.join(Object.values(fields), sql`,`)}
    from ${table}
    where ${fields.roleId}=${roleId}
  `);

export const deleteRolesScope = async (roleId: string, scopeId: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.scopeId} = ${scopeId} and ${fields.roleId} = ${roleId}
  `);

  if (rowCount < 1) {
    throw new DeletionError(RolesScopes.table);
  }
};
