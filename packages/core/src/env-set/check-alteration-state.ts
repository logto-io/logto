import { getAvailableAlterations } from '@logto/cli/lib/commands/database/alteration/index.js';
import type { DatabasePool } from '@silverhand/slonik';
import chalk from 'chalk';

import { consoleLog } from '#src/utils/console.js';

export const checkAlterationState = async (pool: DatabasePool) => {
  const alterations = await getAvailableAlterations(pool);

  if (alterations.length === 0) {
    return;
  }

  consoleLog.error(
    `Found undeployed database alterations, you must deploy them first by ${chalk.green(
      'npm run alteration deploy'
    )} command.\n\n` +
      ` See ${chalk.blue(
        'https://docs.logto.io/docs/tutorials/using-cli/database-alteration'
      )} for reference.\n`
  );

  throw new Error(`Undeployed database alterations found.`);
};
