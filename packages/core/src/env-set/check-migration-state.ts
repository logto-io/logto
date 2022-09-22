import inquirer from 'inquirer';
import { DatabasePool } from 'slonik';

import { getUndeployedMigrations, runMigrations } from '@/migration';

import { allYes } from './parameters';

export const checkMigrationState = async (pool: DatabasePool) => {
  const migrations = await getUndeployedMigrations(pool);

  if (migrations.length === 0) {
    return;
  }

  const error = new Error(
    `Found undeployed migrations, you must deploy them first by "pnpm migration-deploy" command, reference: https://docs.logto.io/docs/recipes/deployment/#migration`
  );

  if (allYes) {
    throw error;
  }

  const deploy = await inquirer.prompt({
    type: 'confirm',
    name: 'value',
    message: `Found undeployed migrations, would you like to deploy now?`,
  });

  if (!deploy.value) {
    throw error;
  }

  await runMigrations(pool);
};
