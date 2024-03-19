import { GlobalValues } from '@logto/shared';
import { appendPath } from '@silverhand/essentials';
import { sql } from '@silverhand/slonik';

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

    /** Get `endpoint` and `tokenEndpoints` */
    const globalValues = new GlobalValues();
    const { cloudUrlSet, adminUrlSet } = globalValues;
    const endpoint = appendPath(cloudUrlSet.endpoint, 'api').toString();
    const tokenEndpoint = appendPath(adminUrlSet.endpoint, 'oidc/token').toString();

    const { rows: rawEmailServiceConnectors } = await pool.query<EmailServiceConnector>(sql`
      select tenant_id, config from connectors where connector_id = ${ServiceConnector.Email};
    `);
    const tenantIdsWithM2mCredentials = new Set(cloudConnections.map(({ tenantId }) => tenantId));
    const emailServiceConnectors = rawEmailServiceConnectors.filter(({ tenantId }) =>
      tenantIdsWithM2mCredentials.has(tenantId)
    );
    for (const emailServiceConnector of emailServiceConnectors) {
      const { tenantId: currentTenantId, config } = emailServiceConnector;
      const newConfig = {
        ...config,
        endpoint,
        tokenEndpoint,
        ...cloudConnections.find(({ tenantId }) => tenantId === currentTenantId)?.value,
      };
      // eslint-disable-next-line no-await-in-loop
      await pool.query(sql`
        update connectors set config = ${JSON.stringify(
          newConfig
        )} where tenant_id = ${currentTenantId} and connector_id = ${ServiceConnector.Email};
      `);
    }
  },
};

export default alteration;
