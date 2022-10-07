import { getUndeployedAlterations } from '@logto/cli/lib/commands/database/alteration';
import { DatabasePool } from 'slonik';

export const checkAlterationState = async (pool: DatabasePool) => {
  const alterations = await getUndeployedAlterations(pool);

  if (alterations.length === 0) {
    return;
  }

  throw new Error(
    `Found undeployed database alterations, you must deploy them first by "npm run alteration deploy" command, reference: https://docs.logto.io/docs/recipes/deployment/#database-alteration`
  );
};
