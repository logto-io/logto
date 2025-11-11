import { getAvailableAlterations } from '@logto/cli/lib/commands/database/alteration/index.js';
import { idFormatDataGuard, ServiceLogs, Systems } from '@logto/schemas';
import { ConsoleLog, isKeyInObject } from '@logto/shared';
import { conditionalString } from '@silverhand/essentials';
import { sql, type CommonQueryMethods, type DatabasePool } from '@silverhand/slonik';
import chalk from 'chalk';

import { EnvSet } from './index.js';

const consoleLog = new ConsoleLog(chalk.magenta('pre'));

export const checkPreconditions = async (pool: DatabasePool) => {
  checkDeprecations();
  await Promise.all([checkAlterationState(pool), checkRowLevelSecurity(pool), checkIdFormat(pool)]);
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
 * If ID_FORMAT is not set, adopt the database value automatically.
 * If they conflict, refuse to start.
 */
const checkIdFormat = async (pool: CommonQueryMethods) => {
  const envFormat = EnvSet.values.idFormat;
  const result = await pool.maybeOne<{ value: unknown }>(sql`
    select ${sql.identifier(['value'])} from ${sql.identifier([Systems.table])}
    where ${sql.identifier(['key'])} = ${'idFormat'}
  `);

  if (!result) {
    // No row exists (first start before seed) — skip, the seed process will store it.
    return;
  }

  const parsed = idFormatDataGuard.safeParse(result.value);

  if (!parsed.success) {
    consoleLog.error(
      'Invalid ID format configuration found in database (systems.idFormat). ' +
        'The stored value does not match the expected schema. Please fix or remove this row and try again.'
    );
    consoleLog.error(parsed.error.toString());
    throw new Error(
      'Startup aborted due to invalid ID format configuration in the database (systems.idFormat).'
    );
  }

  const databaseFormat = parsed.data.format;

  // If env is not set, adopt the database format
  if (!envFormat) {
    process.env.ID_FORMAT = databaseFormat;
    consoleLog.info(`ID format loaded from database: '${databaseFormat}'`);
    return;
  }

  if (databaseFormat !== envFormat) {
    throw new Error(
      `ID format mismatch: database is locked to '${databaseFormat}' but ID_FORMAT env is set to '${envFormat}'. ` +
        `Once set, the ID format cannot be changed. Update your ID_FORMAT environment variable to '${databaseFormat}'.`
    );
  }
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
