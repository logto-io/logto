import { sql } from 'slonik';

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
  },
  down: async (pool) => {
    await pool.query(sql`alter table roles drop column type;`);
    await pool.query(sql`drop type role_type;`);
  },
};

export default alteration;
