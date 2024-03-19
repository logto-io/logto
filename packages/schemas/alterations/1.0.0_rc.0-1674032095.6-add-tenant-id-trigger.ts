import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const tables: string[] = [
  'applications',
  'applications_roles',
  'connectors',
  'custom_phrases',
  'logs',
  'oidc_model_instances',
  'passcodes',
  'resources',
  'roles_scopes',
  'roles',
  'scopes',
  'settings',
  'sign_in_experiences',
  'users_roles',
  'users',
];

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create function set_tenant_id() returns trigger as
      $$ begin
        select tenants.id into new.tenant_id
            from tenants
            where ('tenant_user_' || tenants.id) = current_user;

        if new.tenant_id is null then
            new.tenant_id := 'default';
        end if;

        return new;
      end; $$ language plpgsql;
    `);

    await Promise.all(
      tables.map(async (table) =>
        pool.query(sql`
          create trigger set_tenant_id before insert on ${sql.identifier([table])}
          for each row execute procedure set_tenant_id();
        `)
      )
    );
  },
  down: async (pool) => {
    await Promise.all(
      tables.map(async (table) =>
        pool.query(sql`
          drop trigger set_tenant_id on ${sql.identifier([table])};
        `)
      )
    );

    await pool.query(sql`drop function set_tenant_id;`);
  },
};

export default alteration;
