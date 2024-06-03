import { getAvailableAlterations } from '@logto/cli/lib/commands/database/alteration/index.js';
import { ServiceLogs, Systems } from '@logto/schemas';
import { ConsoleLog, isKeyInObject } from '@logto/shared';
import { conditionalString } from '@silverhand/essentials';
import { sql, type CommonQueryMethods, type DatabasePool } from '@silverhand/slonik';
import chalk from 'chalk';

import { EnvSet } from './index.js';

const consoleLog = new ConsoleLog(chalk.magenta('pre'));

export const checkPreconditions = async (pool: DatabasePool) => {
  checkDeprecations();
  await Promise.all([checkAlterationState(pool), checkRowLevelSecurity(pool)]);
};

const checkRowLevelSecurity = async (client: CommonQueryMethods) => {
  const { rows } = await client.query(sql`
    select tablename
    from pg_catalog.pg_tables
    where schemaname = current_schema()
    and rowsecurity=false
  `);

  const rlsDisabled = rows.filter(
    ({ tablename }) => tablename !== Systems.table && tablename !== ServiceLogs.table
  );

  if (rlsDisabled.length > 0) {
    throw new Error(
      'Row-level security has to be enforced on EVERY business table when starting Logto.\n' +
        `Found following table(s) without RLS: ${rlsDisabled
          .map((row) => conditionalString(isKeyInObject(row, 'tablename') && String(row.tablename)))
          .join(', ')}\n\n` +
        'Did you forget to run `npm cli db alteration deploy`?'
    );
  }
};

const checkAlterationState = async (pool: CommonQueryMethods) => {
  const alterations = await getAvailableAlterations(pool);

  if (alterations.length === 0) {
    return;
  }

  consoleLog.error(
    `Found undeployed database alterations, you must deploy them first by ${chalk.green(
      'npm run alteration deploy'
    )} command.\n\n` +
      ` See ${chalk.blue(
        'https://docs.logto.io/docs/references/using-cli/database-alteration'
      )} for reference.\n`
  );

  throw new Error(`Undeployed database alterations found.`);
};

const checkDeprecations = () => {
  if (EnvSet.values.userDefaultRoleNames.length > 0) {
    consoleLog.warn(
      `The environment variable ${chalk.green(
        'USER_DEFAULT_ROLE_NAMES'
      )} is deprecated and will be removed in the next major version. Please use the built-in user default role configuration (${chalk.green(
        'Roles.isDefault'
      )}) instead.\n`
    );
  }
};
