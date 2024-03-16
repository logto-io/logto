import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminConsoleConfigKey = 'adminConsole';

type OldAdminConsoleData = {
  signInExperienceCustomized: boolean;
} & Record<string, unknown>;

type OldLogtoAdminConsoleConfig = {
  tenantId: string;
  value: OldAdminConsoleData;
};

type NewAdminConsoleData = {
  signInExperienceCustomized: boolean;
  organizationCreated: boolean;
} & Record<string, unknown>;

type NewLogtoAdminConsoleConfig = {
  tenantId: string;
  value: NewAdminConsoleData;
};

const alterAdminConsoleData = async (
  logtoConfig: OldLogtoAdminConsoleConfig,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: oldAdminConsoleConfig } = logtoConfig;

  const newAdminConsoleData: NewAdminConsoleData = {
    ...oldAdminConsoleConfig,
    organizationCreated: false,
  };

  await pool.query(
    sql`update logto_configs set value = ${JSON.stringify(
      newAdminConsoleData
    )} where tenant_id = ${tenantId} and key = ${adminConsoleConfigKey}`
  );
};

const rollbackAdminConsoleData = async (
  logtoConfig: NewLogtoAdminConsoleConfig,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: newAdminConsoleConfig } = logtoConfig;

  const { organizationCreated, ...oldAdminConsoleData } = newAdminConsoleConfig;

  await pool.query(
    sql`update logto_configs set value = ${JSON.stringify(
      oldAdminConsoleData
    )} where tenant_id = ${tenantId} and key = ${adminConsoleConfigKey}`
  );
};

const alteration: AlterationScript = {
  up: async (pool) => {
    const rows = await pool.many<OldLogtoAdminConsoleConfig>(
      sql`select * from logto_configs where key = ${adminConsoleConfigKey}`
    );
    await Promise.all(rows.map(async (row) => alterAdminConsoleData(row, pool)));
  },
  down: async (pool) => {
    const rows = await pool.many<NewLogtoAdminConsoleConfig>(
      sql`select * from logto_configs where key = ${adminConsoleConfigKey}`
    );
    await Promise.all(rows.map(async (row) => rollbackAdminConsoleData(row, pool)));
  },
};

export default alteration;
