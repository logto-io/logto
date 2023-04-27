import { generateStandardId } from '@logto/shared';
import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

export enum HookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

type HookConfig = {
  url: string;
  headers?: Record<string, string>;
  retries?: number;
  signingKey?: string;
};

type Hook = {
  tenantId: string;
  id: string;
  name: string | null;
  event: HookEvent | null;
  events: HookEvent[] | null;
  config: HookConfig;
  enabled: boolean;
  createdAt: number;
};

const defaultRetries = 3;

const alteration: AlterationScript = {
  down: async (pool) => {
    await pool.query(sql`
      alter table hooks
        add column name varchar(256),
        add column events jsonb,
        add column enabled boolean not null default true,
        alter column event drop not null;
      update hooks set name = concat('Hook_', id);
    `);
  },
  up: async (pool) => {
    await pool.query(sql`
      delete from hooks where enabled = false;
    `);

    const { rows: hooks } = await pool.query<Hook>(sql`
      select * from hooks;
    `);

    /* eslint-disable no-await-in-loop */
    for (const { id, tenantId, events, config } of hooks) {
      const {
        signingKey, // Exclude signingKey
        retries,
        ...rest
      } = config;

      const updatedConfig = {
        ...rest,
        retries: retries ?? defaultRetries,
      };

      if (!events) {
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
          insert into hooks (id, tenant_id, name, event, config)
          values (${hookId}, ${tenantId}, ${'Hook_' + hookId}, ${event}, ${JSON.stringify(
          updatedConfig
        )});
        `);
      }
    }
    /* eslint-enable no-await-in-loop */

    await pool.query(sql`
      alter table hooks
        alter column event set not null,
        drop column name,
        drop column events,
        drop column enabled;
    `);
  },
};

export default alteration;
