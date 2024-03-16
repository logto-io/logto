import { type CommonQueryMethods, sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const getDatabaseName = async (pool: CommonQueryMethods) => {
  const { currentDatabase } = await pool.one<{ currentDatabase: string }>(sql`
    select current_database();
  `);

  return currentDatabase.replaceAll('-', '_');
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const database = await getDatabaseName(pool);
    const baseRoleId = sql.identifier([`logto_tenant_${database}`]);

    await pool.query(sql`
      create type sentinel_action_result as enum ('Success', 'Failed');

      create type sentinel_decision as enum ('Undecided', 'Allowed', 'Blocked', 'Challenge');

      create table sentinel_activities (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null,
        /** The target that the action was performed on. */
        target_type varchar(32) /* @use SentinelActivityTargetType */ not null,
        /** The target hashed identifier. */
        target_hash varchar(64) not null,
        /** The action name that was performed. */
        action varchar(64) /* @use SentinelActivityAction */ not null,
        /** If the action was successful or not. */
        action_result sentinel_action_result not null,
        /** Additional payload data if any. */
        payload jsonb /* @use SentinelActivityPayload */ not null,
        /** The sentinel decision for the action. */
        decision sentinel_decision not null,
        /** The expiry date of the decision. */
        decision_expires_at timestamptz not null default(now()),
        /** The time the activity was created. */
        created_at timestamptz not null default(now()),
        primary key (id)
      );

      create index sentinel_activities__id
        on sentinel_activities (tenant_id, id);

      create index sentinel_activities__target_type_target_hash_action_action_result_decision
        on sentinel_activities (tenant_id, target_type, target_hash, action, action_result, decision);

      create trigger set_tenant_id before insert on sentinel_activities
        for each row execute procedure set_tenant_id();

      alter table sentinel_activities enable row level security;

      create policy sentinel_activities_tenant_id on sentinel_activities
        as restrictive
        using (tenant_id = (select id from tenants where db_user = current_user));

      create policy sentinel_activities_modification on sentinel_activities
        using (true);

      grant select, insert, update, delete on sentinel_activities to ${baseRoleId};
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      drop policy sentinel_activities_tenant_id on sentinel_activities;
      drop policy sentinel_activities_modification on sentinel_activities;

      drop table sentinel_activities;
      drop type sentinel_action_result;
      drop type sentinel_decision;
    `);
  },
};

export default alteration;
