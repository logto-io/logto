import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    // Remove set_tenant_name trigger.
    await pool.query(sql`
      drop trigger set_tenant_name_trigger on tenants;
      drop function set_tenant_name;
    `);
    // Set tenant name to "My project" as default tenant name.
    await pool.query(sql`
      update tenants set "name" = 'My Project';
    `);
    await pool.query(sql`
      alter table tenants alter column "name" set default 'My Project';
    `);
  },
  down: async (pool) => {
    // Create a trigger to set the tenant name since column reference is not available as default value.
    await pool.query(sql`
      create function set_tenant_name() returns trigger as
      $$ begin
        new.name := concat('tenant_', new.id);
        return new;
      end; $$ language plpgsql;
    `);
    await pool.query(sql`
      create trigger set_tenant_name_trigger
      before insert on tenants
      for each row when (new.name is null)
      execute procedure set_tenant_name();
    `);
    await pool.query(sql`
      alter table tenants alter column "name" drop default;
    `);
    await pool.query(sql`
      update tenants set "name" = concat('tenant_', id);
    `);
  },
};
export default alteration;
