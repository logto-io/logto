import { assertEnv } from '@silverhand/essentials';
import inquirer from 'inquirer';
import { createPool } from 'slonik';
import { createInterceptors } from 'slonik-interceptor-preset';

import appendDotEnv from './append-dot-env';
import { noInquiry } from './parameters';

const createPoolByEnv = async (isTest: boolean) => {
  // Database connection is disabled in unit test environment
  if (isTest) {
    return;
  }

  const key = 'DB_URL';
  const interceptors = [...createInterceptors()];

  try {
    const databaseDsn = assertEnv(key);

    return createPool(databaseDsn, { interceptors });
  } catch (error: unknown) {
    if (noInquiry) {
      throw error;
    }

    const answer = await inquirer.prompt({
      name: 'dsn',
      message: `No Postgres DSN (${key}) found in env variables. Please input the DSN which points to Logto database:`,
    });

    if (!answer.dsn) {
      throw error;
    }

    appendDotEnv(key, answer.dsn);

    return createPool(answer.dsn, { interceptors });
  }
};

export default createPoolByEnv;
