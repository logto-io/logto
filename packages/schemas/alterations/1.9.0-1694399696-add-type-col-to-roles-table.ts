import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum InternalRole {
  Admin = '#internal:admin',
}

const alteration: AlterationScript = {
  up: async (pool) => {
    // Get all m2m role ids.
    const { rows: m2mRoleIds } = await pool.query<{ id: string }>(sql`
      select roles.id as "id" from roles
        left join applications_roles on applications_roles.role_id = roles.id and applications_roles.tenant_id = roles.tenant_id
        left join applications on applications.id = applications_roles.application_id and applications.tenant_id = applications_roles.tenant_id
      where applications.type = 'MachineToMachine' or roles.name = ${InternalRole.Admin} group by roles.id;
    `);
    // Add `type` column to `roles` table, and set `type` to 'MachineToMachine' for all m2m roles.
    await pool.query(sql`
      create type role_type as enum ('User', 'MachineToMachine');
    `);
    await pool.query(sql`alter table roles add column type role_type not null default 'User';`);
    await pool.query(sql`
      update roles set type = 'MachineToMachine' where id in (${sql.join(
        m2mRoleIds.map(({ id }) => id),
        sql`, `
      )});
    `);
    // Add role type check function and constraints for recording user/application-role relations.
    await pool.query(sql`
      create function check_role_type(role_id varchar(21), target_type role_type) returns boolean as
      $$ begin
        return (select type from roles where id = role_id) = target_type;
      end; $$ language plpgsql;
    `);
    await pool.query(sql`
      alter table users_roles add constraint users_roles__role_type
          check (check_role_type(role_id, 'User'));
    `);
    await pool.query(
      sql`alter table applications_roles add constraint applications_roles__role_type check (check_role_type(role_id, 'MachineToMachine'));`
    );
  },
  down: async (pool) => {
    await pool.query(
      sql`alter table applications_roles drop constraint applications_roles__role_type;`
    );
    await pool.query(sql`alter table users_roles drop constraint users_roles__role_type;`);
    await pool.query(sql`drop function check_role_type;`);
    await pool.query(sql`alter table roles drop column type;`);
    await pool.query(sql`drop type role_type;`);
  },
};

export default alteration;
