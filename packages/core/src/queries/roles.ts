import type { CreateRole, Role } from '@logto/schemas';
import { SearchJointMode, Roles } from '@logto/schemas';
import type { OmitAutoSetFields } from '@logto/shared';
import { conditionalSql, convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import { buildFindEntityById } from '#src/database/find-entity-by-id.js';
import { buildInsertInto } from '#src/database/insert-into.js';
import { buildUpdateWhere } from '#src/database/update-where.js';
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

export const countRoles = async (search: Search = defaultUserSearch) =>
  envSet.pool.one<{ count: number }>(sql`
    select count(*)
    from ${table}
    ${buildRoleConditions(search)}
  `);

export const findRoles = async (limit: number, offset: number, search: Search) =>
  envSet.pool.any<Role>(
    sql`
      select ${sql.join(
        Object.values(fields).map((field) => sql`${table}.${field}`),
        sql`,`
      )}
      from ${table}
      ${buildRoleConditions(search)}
      limit ${limit}
      offset ${offset}
    `
  );

export const findRolesByRoleIds = async (roleIds: string[]) =>
  roleIds.length > 0
    ? envSet.pool.any<Role>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(roleIds, sql`, `)})
    `)
    : [];

export const findRolesByRoleNames = async (roleNames: string[]) =>
  roleNames.length > 0
    ? envSet.pool.any<Role>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.name} in (${sql.join(roleNames, sql`, `)})
    `)
    : [];

export const findRoleByRoleName = async (roleName: string, excludeRoleId?: string) =>
  envSet.pool.maybeOne<Role>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.name} = ${roleName}
    ${conditionalSql(excludeRoleId, (id) => sql`and ${fields.id}<>${id}`)}
  `);

export const insertRoles = async (roles: Role[]) =>
  envSet.pool.query(sql`
    insert into ${table} (${fields.id}, ${fields.name}, ${fields.description}) values
    ${sql.join(
      roles.map(({ id, name, description }) => sql`(${id}, ${name}, ${description})`),
      sql`, `
    )}
  `);

export const insertRole = buildInsertInto<CreateRole, Role>(Roles, {
  returning: true,
});

export const findRoleById = buildFindEntityById<CreateRole, Role>(Roles);

const updateRole = buildUpdateWhere<CreateRole, Role>(Roles, true);

export const updateRoleById = async (id: string, set: Partial<OmitAutoSetFields<CreateRole>>) =>
  updateRole({ set, where: { id }, jsonbMode: 'merge' });

export const deleteRoleById = async (id: string) => {
  const { rowCount } = await envSet.pool.query(sql`
    delete from ${table}
    where ${fields.id}=${id}
  `);

  if (rowCount < 1) {
    throw new DeletionError(Roles.table, id);
  }
};
