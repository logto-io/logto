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
  await Promise.all([
    checkAlterationState(pool),
    checkRowLevelSecurity(pool),
    checkIdFormat(pool),
  ]);
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

/**
 * Validate the ID format configuration.
 * If the database has a locked-in format (stored during seed), it must match the ENV variable.
 * If they differ, refuse to start.
 */
const checkIdFormat = async (pool: CommonQueryMethods) => {
  const envFormat = EnvSet.values.idFormat;
  const result = await pool.maybeOne<{ value: unknown }>(sql`
    select ${sql.identifier(['value'])} from ${sql.identifier([Systems.table])}
    where ${sql.identifier(['key'])} = ${'idFormat'}
  `);

  if (result) {
    const { value } = result;
    const dbFormat =
      typeof value === 'object' && value !== null && 'format' in value
        ? String((value as { format: string }).format)
        : undefined;

    if (dbFormat && dbFormat !== envFormat) {
      throw new Error(
        `ID format mismatch: database is locked to '${dbFormat}' but ID_FORMAT env is set to '${envFormat}'. ` +
          `Once set, the ID format cannot be changed. Update your ID_FORMAT environment variable to '${dbFormat}'.`
      );
    }
  }
  // If no row exists (first start before seed), skip — the seed process will store it.
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
