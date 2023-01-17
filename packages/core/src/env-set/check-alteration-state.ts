import { getAvailableAlterations } from '@logto/cli/lib/commands/database/alteration/index.js';
import chalk from 'chalk';
import type { DatabasePool } from 'slonik';

export const checkAlterationState = async (pool: DatabasePool) => {
  const alterations = await getAvailableAlterations(pool);

  if (alterations.length === 0) {
    return;
  }

  console.error(
    `${chalk.red(
      '[error]'
    )} Found undeployed database alterations, you must deploy them first by ${chalk.green(
      'npm run alteration deploy'
    )} command.\n\n` +
      ` See ${chalk.blue(
        'https://docs.logto.io/docs/tutorials/using-cli/database-alteration'
      )} for reference.\n`
  );

  throw new Error(`Undeployed database alterations found.`);
};
