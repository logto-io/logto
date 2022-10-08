import { assertEnv } from '@silverhand/essentials';
import chalk from 'chalk';
import { createPool } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

const createPoolByEnv = async (isTest: boolean) => {
  // Database connection is disabled in unit test environment
  if (isTest) {
    return;
  }

  const key = 'DB_URL';
  const interceptors = [...createInterceptors()];

  try {
    const databaseDsn = assertEnv(key);

    return await createPool(databaseDsn, { interceptors });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === `env variable ${key} not found`) {
      console.error(
        `${chalk.red('[error]')} No Postgres DSN (${chalk.green(
          key
        )}) found in env variables.\n\n` +
          `  Either provide it in your env, or add it to the ${chalk.blue(
            '.env'
          )} file in the Logto project root.\n\n` +
          `  If you want to set up a new Logto database, run ${chalk.green(
            'npm run cli db seed'
          )} before setting env ${chalk.green(key)}.\n\n` +
          `  Visit ${chalk.blue(
            'https://docs.logto.io/docs/references/core/configuration'
          )} for more info about setting up env.\n`
      );
    }

    throw error;
  }
};

export default createPoolByEnv;
