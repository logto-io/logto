import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminTenantId = 'admin';

const cloudServiceApplicationName = 'Cloud Service';

const cloudConnectionResourceIndicator = 'https://cloud.logto.io/api';

enum ApplicationType {
  Native = 'Native',
  SPA = 'SPA',
  Traditional = 'Traditional',
  MachineToMachine = 'MachineToMachine',
}

const cloudConnectionConfigKey = 'cloudConnection';

type Application = {
  tenantId: string;
  id: string;
  name: string;
  secret: string;
  description: string;
  type: ApplicationType;
  oidcClientMetadata: unknown;
  customClientMetadata: {
    tenantId: string;
  };
  createdAt: number;
};

type CloudConnectionConfig = {
  tenantId: string;
  key: string;
  value: unknown;
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const { rows } = await pool.query<Application>(
      sql`select * from applications where type = ${ApplicationType.MachineToMachine} and tenant_id = ${adminTenantId} and name = ${cloudServiceApplicationName}`
    );

    const { rows: existingCloudConnections } = await pool.query<CloudConnectionConfig>(sql`
      select * from logto_configs where key = ${cloudConnectionConfigKey}
    `);
    const tenantIdsWithExistingRecords = new Set(
      existingCloudConnections.map(({ tenantId }) => tenantId)
    );
    const filteredRows = rows.filter(
      ({ customClientMetadata: { tenantId } }) => !tenantIdsWithExistingRecords.has(tenantId)
    );

    if (filteredRows.length === 0) {
      return;
    }

    await pool.query(sql`
      insert into logto_configs (tenant_id, key, value) values ${sql.join(
        filteredRows.map(({ id, secret, customClientMetadata }) => {
          const { tenantId } = customClientMetadata;
          const cloudConnectionValue = {
            appId: id,
            appSecret: secret,
            resource: cloudConnectionResourceIndicator,
          };

          return sql`(${tenantId}, ${cloudConnectionConfigKey}, ${JSON.stringify(
            cloudConnectionValue
          )})`;
        }),
        sql`,`
      )}
    `);
  },
  down: async (pool) => {
    await pool.query(sql`
      delete from logto_configs where key = ${cloudConnectionConfigKey}
    `);
  },
};

export default alteration;
