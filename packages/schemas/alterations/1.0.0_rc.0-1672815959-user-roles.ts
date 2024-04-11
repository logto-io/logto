import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table users_roles (
        user_id varchar(21) not null references users (id) on update cascade on delete cascade,
        role_id varchar(21) not null references roles (id) on update cascade on delete cascade,
        primary key (user_id, role_id)
      );
    `);
    const users = await pool.any<{ id: string; roleNames: string[] }>(sql`
      select * from users where jsonb_array_length(role_names) > 0
    `);
    const roles = await pool.any<{ id: string; name: string }>(sql`
      select * from roles
    `);

    for (const user of users) {
      for (const roleName of user.roleNames) {
        if (!roleName) {
          continue;
        }

        const role = roles.find(({ name }) => name === roleName);

        if (!role) {
          throw new Error(`Unable to find role: ${roleName}`);
        }

        // eslint-disable-next-line no-await-in-loop
        await pool.query(sql`
          insert into users_roles (user_id, role_id) values (${user.id}, ${role.id})
        `);
      }
    }

    await pool.query(sql`
      alter table users drop column role_names
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table users add column role_names jsonb not null default '[]'::jsonb
    `);

    const relations = await pool.any<{ userId: string; roleId: string }>(sql`
      select * from users_roles
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
        update users 
        set role_names = role_names || ${sql.jsonb([role.name])}
        where id = ${relation.userId}
      `);
    }

    await pool.query(sql`
      drop table users_roles;
    `);
  },
};

export default alteration;
