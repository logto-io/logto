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

type NewHookConfig = OldHookConfig & {
  signingKey: string;
};

type NewHook = OldHook & {
  name: string;
  events: HookEvent[];
  enabled: boolean;
  config: NewHookConfig;
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const { rows: oldHooks } = await pool.query<OldHook>(sql`
      select * from hooks;
    `);

    await pool.query(sql`
      alter table hooks
        add column name varchar(256),
        add column events jsonb,
        add column enabled boolean not null default true
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
    const { rows: newHooks } = await pool.query<NewHook>(sql`
      select * from hooks;
    `);

    await Promise.all(
      newHooks.map(async ({ id, tenantId, config }) => {
        const { signingKey, ...oldConfig } = config;
        await pool.query(sql`
          update hooks
          set config = ${JSON.stringify(oldConfig)}
          where id = ${id} and tenant_id = ${tenantId};
        `);
      })
    );

    await pool.query(sql`
      delete from hooks where enabled = false;
    `);

    await pool.query(sql`
      alter table hooks
      drop column name,
      drop column events,
      drop column enabled;
    `);
  },
};

export default alteration;
