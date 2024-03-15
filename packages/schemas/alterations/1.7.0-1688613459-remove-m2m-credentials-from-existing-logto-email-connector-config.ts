import { sql } from 'slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

type M2mCredentials = {
  appSecret: string;
  appId: string;
  endpoint: string;
  tokenEndpoint: string;
  resource: string;
};

type EmailServiceConnector = {
  tenantId: string;
  config: Partial<M2mCredentials> & Record<string, unknown>;
};
type CloudConnectionData = {
  tenantId: string;
  value: { appSecret: string; appId: string; resource: string };
};

enum ServiceConnector {
  Email = 'logto-email',
}

const cloudConnectionKey = 'cloudConnection';

const alteration: AlterationScript = {
  up: async (pool) => {
    const { rows: rawConnectors } = await pool.query<EmailServiceConnector>(sql`
      select tenant_id, config from connectors where connector_id = ${ServiceConnector.Email};
    `);
    const connectors = rawConnectors.map((rawConnector) => {
      const {
        tenantId,
        config: { appSecret, appId, endpoint, tokenEndpoint, resource, ...rest },
      } = rawConnector;
      return { tenantId, config: rest };
    });
    for (const connector of connectors) {
      const { tenantId, config } = connector;
      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        update connectors set config = ${JSON.stringify(
          config
        )} where tenant_id = ${tenantId} and connector_id = ${ServiceConnector.Email};
      `);
    }
  },
  down: async (pool) => {
    const { rows: cloudConnections } = await pool.query<CloudConnectionData>(sql`
      select tenant_id, value from logto_configs where key = ${cloudConnectionKey};
    `);
    const { rows: rawEmailServiceConnectors } = await pool.query<EmailServiceConnector>(sql`
      select tenant_id, config from connectors where connector_id = ${ServiceConnector.Email};
    `);

    if (cloudConnections.length === 0 || rawEmailServiceConnectors.length === 0) {
      console.log('No cloud connections or email service connectors found. Skipping...');
      return;
    }

    throw new Error(
      'Down migration is removed due to dependency cleanup. Please see the pull request for more details.'
    );
  },
};

export default alteration;
