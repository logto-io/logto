import 'module-alias/register';
import { assertEnv } from '@silverhand/essentials';
import { createPool } from 'slonik';

import { configDotEnv } from '@/env-set/dot-env';
import { runMigrations } from '@/migration';

configDotEnv();

const deploy = async () => {
  const databaseUrl = assertEnv('DB_URL');
  const pool = await createPool(databaseUrl);
  await runMigrations(pool);
  await pool.end();
};

void deploy();
