import { getRowsByKeys } from '@logto/cli/lib/queries/logto-config.js';
import type { LogtoOidcConfigType } from '@logto/schemas';
import { logtoOidcConfigGuard, LogtoOidcConfigKey } from '@logto/schemas';
import chalk from 'chalk';
import type { DatabasePool, DatabaseTransactionConnection } from 'slonik';
import { z, ZodError } from 'zod';

export const getOidcConfigs = async (
  pool: DatabasePool | DatabaseTransactionConnection
): Promise<LogtoOidcConfigType> => {
  try {
    const { rows } = await getRowsByKeys(pool, Object.values(LogtoOidcConfigKey));

    return z
      .object(logtoOidcConfigGuard)
      .parse(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
  } catch (error: unknown) {
    if (error instanceof ZodError) {
      console.error(
        error.issues
          .map(({ message, path }) => `${message} at ${chalk.green(path.join('.'))}`)
          .join('\n')
      );
    } else {
      console.error(error);
    }

    console.error(
      `\n${chalk.red('[error]')} Failed to get OIDC configs from your Logto database.` +
        ' Did you forget to seed your database?\n\n' +
        `  Use ${chalk.green('npm run cli db seed')} to seed your Logto database;\n` +
        `  Or use ${chalk.green('npm run cli db seed oidc')} to seed OIDC configs alone.\n`
    );
    throw new Error('Failed to get configs');
  }
};
