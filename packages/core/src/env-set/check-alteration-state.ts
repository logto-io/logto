import { getUndeployedAlterations } from '@logto/cli/lib/commands/database/alteration';
import chalk from 'chalk';
import { DatabasePool } from 'slonik';

export const checkAlterationState = async (pool: DatabasePool) => {
  const alterations = await getUndeployedAlterations(pool);

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
