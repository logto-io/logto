import { generateStandardId } from '@logto/shared';
import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

export enum HookEvent {
  PostRegister = 'PostRegister',
  PostSignIn = 'PostSignIn',
  PostResetPassword = 'PostResetPassword',
}

type OldHookConfig = {
  url: string;
  headers?: Record<string, string>;
  retries: number;
};

type OldHook = {
  tenantId: string;
  id: string;
  event: HookEvent;
  config: OldHookConfig;
};

type NewHookConfig = Omit<OldHookConfig, 'retries'> & {
  signingKey: string;
  retries?: number;
};

type NewHook = Pick<OldHook, 'tenantId' | 'id'> & {
  name: string;
  events: HookEvent[];
  enabled: boolean;
  config: NewHookConfig;
};

const defaultRetries = 3;

const alteration: AlterationScript = {
  up: async (pool) => {
    const { rows: oldHooks } = await pool.query<OldHook>(sql`
      select * from hooks;
    `);

    await pool.query(sql`
      alter table hooks
        add column name varchar(256),
        add column events jsonb,
        add column enabled boolean not null default true,
        alter column event drop not null;
    `);

    await Promise.all(
      oldHooks.map(async ({ id, event, tenantId, config }) => {
        await pool.query(sql`
          update hooks
          set name = ${'Hook_' + id},
          events = ${JSON.stringify([event])},
          config = ${JSON.stringify({
            ...config,
            signingKey: generateStandardId(),
          })}
          where id = ${id} and tenant_id = ${tenantId};
        `);
      })
    );

    await pool.query(sql`
      alter table hooks
      alter column name set not null,
      alter column events set not null;
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from hooks where enabled = false;
      alter table hooks
      alter column events drop not null,
      alter column name drop not null,
      alter column enabled drop not null;
    `);

    const { rows: newHooks } = await pool.query<NewHook>(sql`
      select * from hooks;
    `);

    for (const { id, tenantId, events, config } of newHooks) {
      const {
        signingKey, // Exclude signingKey
        retries,
        ...oldConfig
      } = config;

      const updatedConfig = {
        ...oldConfig,
        retries: retries ?? defaultRetries,
      };

      /* eslint-disable no-await-in-loop */
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
        const newHookId = generateStandardId();

        await pool.query(sql`
          insert into hooks (id, tenant_id, name, event, config)
          values (${newHookId}, ${tenantId}, ${'Hook_' + newHookId}, ${event}, ${JSON.stringify(
          updatedConfig
        )});
        `);
      }
      /* eslint-enable no-await-in-loop */
    }

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
