import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
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
      for each row
      execute procedure set_tenant_name();
    `);
    // Add new tenant columns for name, tag, and created_at.
    await pool.query(sql`
      alter table tenants add column name varchar(128);
      alter table tenants add column tag varchar(64) not null default 'development';
      alter table tenants add column created_at timestamptz not null default(now());
    `);
    // Manually set the name for existing tenants since the trigger is for new tenants only.
    await pool.query(sql`
      update tenants set name = concat('tenant_', id);
    `);
    await pool.query(sql`
      alter table tenants alter column name set not null;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      alter table tenants drop column name;
      alter table tenants drop column tag;
      alter table tenants drop column created_at;
      drop trigger set_tenant_name_trigger on tenants;
      drop function set_tenant_name;
    `);
  },
};
export default alteration;
