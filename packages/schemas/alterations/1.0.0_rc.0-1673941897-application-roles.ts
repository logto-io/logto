import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table applications_roles (
        application_id varchar(21) not null references applications (id) on update cascade on delete cascade,
        role_id varchar(21) not null references roles (id) on update cascade on delete cascade,
        primary key (application_id, role_id)
      );
    `);
    const applications = await pool.any<{ id: string; roleNames: string[] }>(sql`
      select * from applications where jsonb_array_length(role_names) > 0
    `);
    const roles = await pool.any<{ id: string; name: string }>(sql`
      select * from roles
    `);

    for (const application of applications) {
      for (const roleName of application.roleNames) {
        if (!roleName) {
          continue;
        }

        const role = roles.find(({ name }) => name === roleName);

        if (!role) {
          throw new Error(`Unable to find role: ${roleName}`);
        }

        // eslint-disable-next-line no-await-in-loop
        await pool.query(sql`
          insert into applications_roles (application_id, role_id) values (${application.id}, ${role.id})
        `);
      }
    }

    await pool.query(sql`
      alter table applications drop column role_names
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table applications add column role_names jsonb not null default '[]'::jsonb
    `);

    const relations = await pool.any<{ applicationId: string; roleId: string }>(sql`
      select * from applications_roles
    `);
    const roles = await pool.any<{ id: string; name: string }>(sql`
      select * from roles
    `);

    for (const relation of relations) {
      const role = roles.find(({ id }) => id === relation.roleId);

      if (!role) {
        continue;
      }

      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        update applications set role_names = role_names || '[${role.name}]'::jsonb where id = ${relation.applicationId}
      `);
    }

    await pool.query(sql`
      drop table applications_roles;
    `);
  },
};

export default alteration;
