import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const alteration: AlterationScript = {
  up: async (pool) => {
    await pool.query(sql`
      -- Update metadata
      alter table logs rename column type to key;
      alter table logs alter column key type varchar(128);
      alter index logs__type rename to logs__key;

      -- Update token exchange keys
      update logs set "key" = 'ExchangeTokenBy.AuthorizationCode' where "key" = 'CodeExchangeToken';
      update logs set "key" = 'ExchangeTokenBy.RefreshToken' where "key" = 'RefreshTokenExchangeToken';
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      -- Update token exchange keys
      update logs set "key" = 'CodeExchangeToken' where "key" = 'ExchangeTokenBy.AuthorizationCode';
      update logs set "key" = 'RefreshTokenExchangeToken' where "key" = 'ExchangeTokenBy.RefreshToken';

      -- Update metadata
      alter table logs alter column key type varchar(64);
      alter table logs rename column key to type;
      alter index logs__key rename to logs__type;
    `);
  },
};

export default alteration;
