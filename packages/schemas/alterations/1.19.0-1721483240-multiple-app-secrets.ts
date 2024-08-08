import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      -- Remove existing constraint
      alter table organization_application_relations drop constraint application_type;

      -- Drop the function
      drop function check_application_type;

      -- Create a new function that accepts a variadic array of application types
      create function check_application_type(
        application_id varchar(21),
        variadic target_type application_type[]
      ) returns boolean as
      $$ begin
        return (select type from applications where id = application_id) = any(target_type);
      end; $$ language plpgsql set search_path = public;

      -- Add back the constraint
      alter table organization_application_relations
        add constraint application_type
        check (check_application_type(application_id, 'MachineToMachine'));

      -- Create the new table
      create table application_secrets (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        application_id varchar(21) not null
          references applications (id) on update cascade on delete cascade,
        /** The name of the secret. Should be unique within the application. */
        name varchar(256) not null,
        value varchar(64) not null,
        expires_at timestamptz,
        created_at timestamptz not null default now(),
        primary key (tenant_id, application_id, name),
        constraint application_type
          check (check_application_type(application_id, 'MachineToMachine', 'Traditional', 'Protected'))
      );
    `);
    await applyTableRls(pool, 'application_secrets');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'application_secrets');
    await pool.query(sql`
      -- Remove the table
      drop table application_secrets;

      -- Remove the constraint
      alter table organization_application_relations drop constraint application_type;

      -- Drop the function
      drop function check_application_type;

      -- Restore the original function
      create function check_application_type(
        application_id varchar(21),
        target_type application_type
      ) returns boolean as
      $$ begin
        return (select type from applications where id = application_id) = target_type;
      end; $$ language plpgsql set search_path = public;

      -- Add back the constraint
      alter table organization_application_relations
        add constraint application_type
        check (check_application_type(application_id, 'MachineToMachine'));
    `);
  },
};

export default alteration;
