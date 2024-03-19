import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

/**
 * This alteration is a fix on `check_role_type` function, since this function could be called by
 * cloud (at the time the DB schema is `cloud` and can not find `public` functions/tables).
 *
 * As a result, we need to specify the function to be with `public` schema.
 */
const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(
      sql`alter table applications_roles drop constraint applications_roles__role_type;`
    );
    await pool.query(sql`alter table users_roles drop constraint users_roles__role_type;`);
    await pool.query(sql`drop function check_role_type;`);
    await pool.query(sql`
      create function public.check_role_type(role_id varchar(21), target_type role_type) returns boolean as
      $$ begin
        return (select type from public.roles where id = role_id) = target_type;
      end; $$ language plpgsql;
    `);
    await pool.query(sql`
      alter table users_roles add constraint users_roles__role_type
          check (public.check_role_type(role_id, 'User'));
    `);
    await pool.query(
      sql`alter table applications_roles add constraint applications_roles__role_type check (public.check_role_type(role_id, 'MachineToMachine'));`
    );
  },
  down: async (pool) => {
    await pool.query(
      sql`alter table applications_roles drop constraint applications_roles__role_type;`
    );
    await pool.query(sql`alter table users_roles drop constraint users_roles__role_type;`);
    await pool.query(sql`drop function public.check_role_type;`);
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
};

export default alteration;
