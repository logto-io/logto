import { generateStandardId } from '@logto/shared';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

enum HookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

type HookConfig = {
  url: string;
  headers?: Record<string, string>;
  retries?: number;
};

type Hook = {
  tenantId: string;
  id: string;
  name: string;
  event: HookEvent | null;
  events: HookEvent[];
  config: HookConfig;
  signingKey: string;
  enabled: boolean;
  createdAt: number;
};

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      alter table hooks
        add column name varchar(256) not null default '',
        add column events jsonb not null default '[]'::jsonb,
        add column signing_key varchar(64) not null default '',
        add column enabled boolean not null default true,
        alter column event drop not null;
      drop index hooks__event;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from hooks where enabled = false;
    `);

    const { rows: hooks } = await pool.query<Hook>(sql`
      select * from hooks;
    `);

    /* eslint-disable no-await-in-loop */
    for (const { id, tenantId, events, config } of hooks) {
      const { retries, ...rest } = config;

      const updatedConfig = {
        ...rest,
        retries: retries ?? 3,
      };

      if (events.length === 0) {
        await pool.query(sql`
          update hooks
          set config = ${JSON.stringify(updatedConfig)}
          where id = ${id} and tenant_id = ${tenantId};
        `);

        continue;
      }

      for (const [index, event] of events.entries()) {
        if (index === 0) {
          await pool.query(sql`
            update hooks
            set event = ${event},
            config = ${JSON.stringify(updatedConfig)}
            where id = ${id} and tenant_id = ${tenantId};
          `);

          continue;
        }

        // Create new hook when there are multiple events
        const hookId = generateStandardId();

        await pool.query(sql`
          insert into hooks (id, tenant_id,  event, config)
          values (${hookId}, ${tenantId}, ${event}, ${JSON.stringify(updatedConfig)});
        `);
      }
    }
    /* eslint-enable no-await-in-loop */

    await pool.query(sql`
      alter table hooks
        alter column event set not null,
        drop column name,
        drop column events,
        drop column signing_key,
        drop column enabled;
      create index hooks__event on hooks (tenant_id, event);
    `);
  },
};

export default alteration;
