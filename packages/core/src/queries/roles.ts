import type { Role } from '@logto/schemas';
import { Roles } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import { sql } from 'slonik';

import envSet from '#src/env-set/index.js';

const { table, fields } = convertToIdentifiers(Roles);

export const findAllRoles = async () =>
  envSet.pool.any<Role>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
  `);
export const findRolesByRoleIds = async (roleIds: string[]) =>
  roleIds.length > 0
    ? envSet.pool.any<Role>(sql`
      select ${sql.join(Object.values(fields), sql`, `)}
      from ${table}
      where ${fields.id} in (${sql.join(roleIds, sql`, `)})
    `)
    : [];

export const findRolesByRoleNames = async (roleNames: string[]) =>
  envSet.pool.any<Role>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.name} in (${sql.join(roleNames, sql`, `)})
  `);

export const findRoleByRoleName = async (roleName: string) =>
  envSet.pool.maybeOne<Role>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.name} = ${roleName}
  `);

export const insertRoles = async (roles: Role[]) =>
  envSet.pool.query(sql`
    insert into ${table} (${fields.id}, ${fields.name}, ${fields.description}) values
    ${sql.join(
      roles.map(({ id, name, description }) => sql`(${id}, ${name}, ${description})`),
      sql`, `
    )}
  `);
