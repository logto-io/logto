import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

import { applyTableRls, dropTableRls } from './utils/1704934999-tables.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      create table secrets (
        tenant_id varchar(21) not null
          references tenants (id) on update cascade on delete cascade,
        id varchar(21) not null primary key,
        user_id varchar(21) not null 
          references users (id) on update cascade on delete cascade,
        type text /* @user SecretType */ not null,
        /** Encrypted data encryption key (DEK) for the secret. */
        encrypted_dek bytea not null,
        /** Initialization vector for the secret encryption. */
        iv bytea not null,
        /** Authentication tag for the secret encryption. */
        auth_tag bytea not null,
        /** The encrypted secret data. e.g. { access_token, refresh_token }*/
        ciphertext bytea not null,
        /** The metadata associated with the secret. */
        metadata jsonb not null default '{}'::jsonb,
        created_at timestamptz not null default(now()),
        updated_at timestamptz not null default(now())
      );
    `);

    await pool.query(sql`
      create trigger set_updated_at
        before update on secrets
        for each row
        execute procedure set_updated_at();
    `);

    await applyTableRls(pool, 'secrets');
  },
  down: async (pool) => {
    await dropTableRls(pool, 'secrets');

    await pool.query(sql`
      drop table secrets;
    `);
  },
};

export default alteration;
