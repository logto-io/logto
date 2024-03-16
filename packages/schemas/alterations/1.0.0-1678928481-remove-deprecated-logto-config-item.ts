import type { DatabaseTransactionConnection } from '@silverhand/slonik';
import { sql } from '@silverhand/slonik';

import type { AlterationScript } from '../lib/types/alteration.js';

const adminConsoleConfigKey = 'adminConsole';
const defaultAppearanceMode = 'system';
const defaultLanguage = 'en';

type OldAdminConsoleData = {
  language: string;
  appearanceMode: string;
} & Record<string, unknown>;

type OldLogtoAdminConsoleConfig = {
  tenantId: string;
  value: OldAdminConsoleData;
};

type NewAdminConsoleData = Omit<OldAdminConsoleData, 'language' | 'appearanceMode'>;

type NewLogtoAdminConsoleConfig = {
  tenantId: string;
  value: NewAdminConsoleData;
};

const alterAdminConsoleData = async (
  logtoConfig: OldLogtoAdminConsoleConfig,
  pool: DatabaseTransactionConnection
) => {
  const { tenantId, value: oldAdminConsoleData } = logtoConfig;

  const {
    language, // Extract to remove from config
    appearanceMode, // Extract to remove from config
    ...others
  } = oldAdminConsoleData;

  const newAdminConsoleData: NewAdminConsoleData = {
    ...others,
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
  const { tenantId, value: newAdminConsoleData } = logtoConfig;

  const oldAdminConsoleData: OldAdminConsoleData = {
    ...newAdminConsoleData,
    language: defaultLanguage,
    appearanceMode: defaultAppearanceMode,
  };

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
