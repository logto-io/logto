import { Roles, Role } from '@logto/schemas';
import { sql } from 'slonik';

import { convertToIdentifiers } from '@/database/utils';
import envSet from '@/env-set';

const { table, fields } = convertToIdentifiers(Roles);

export const findAllRoles = async () =>
  envSet.pool.any<Role>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
  `);

export const findRolesByRoleNames = async (roleNames: string[]) =>
  envSet.pool.any<Role>(sql`
    select ${sql.join(Object.values(fields), sql`, `)}
    from ${table}
    where ${fields.name} in (${sql.join(roleNames, sql`, `)})
  `);

export const insertRoles = async (roles: Role[]) =>
  envSet.pool.query(sql`
    insert into ${table} (${fields.name}, ${fields.description}) values
    ${sql.join(
      roles.map(({ name, description }) => sql`(${name}, ${description})`),
      sql`, `
    )}
  `);
