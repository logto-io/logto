import inquirer from 'inquirer';
import { DatabasePool } from 'slonik';

import { getUndeployedAlterations, deployAlterations } from '@/alteration';

import { allYes } from './parameters';

export const checkAlterationState = async (pool: DatabasePool) => {
  const alterations = await getUndeployedAlterations(pool);

  if (alterations.length === 0) {
    return;
  }

  const error = new Error(
    `Found undeployed database alterations, you must deploy them first by "npm run alteration deploy" command, reference: https://docs.logto.io/docs/recipes/deployment/#database-alteration`
  );

  if (allYes) {
    throw error;
  }

  const deploy = await inquirer.prompt({
    type: 'confirm',
    name: 'value',
    message: `Found undeployed alterations, would you like to deploy now?`,
  });

  if (!deploy.value) {
    throw error;
  }

  await deployAlterations(pool);
};
