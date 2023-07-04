import type { LogtoOidcConfigType } from '@logto/schemas';
import {
  cloudApiIndicator,
  cloudConnectionDataGuard,
  logtoOidcConfigGuard,
  LogtoOidcConfigKey,
} from '@logto/schemas';
import chalk from 'chalk';
import { z, ZodError } from 'zod';

import type Queries from '#src/tenants/Queries.js';
import { consoleLog } from '#src/utils/console.js';

export const createLogtoConfigLibrary = ({
  logtoConfigs: { getRowsByKeys, getCloudConnectionData: queryCloudConnectionData },
}: Pick<Queries, 'logtoConfigs'>) => {
  const getOidcConfigs = async (): Promise<LogtoOidcConfigType> => {
    try {
      const { rows } = await getRowsByKeys(Object.values(LogtoOidcConfigKey));

      return z
        .object(logtoOidcConfigGuard)
        .parse(Object.fromEntries(rows.map(({ key, value }) => [key, value])));
    } catch (error: unknown) {
      if (error instanceof ZodError) {
        consoleLog.error(
          error.issues
            .map(({ message, path }) => `${message} at ${chalk.green(path.join('.'))}`)
            .join('\n')
        );
      } else {
        consoleLog.error(error);
      }

      consoleLog.error(
        `\nFailed to get OIDC configs from your Logto database.` +
          ' Did you forget to seed your database?\n\n' +
          `  Use ${chalk.green('npm run cli db seed')} to seed your Logto database;\n` +
          `  Or use ${chalk.green('npm run cli db seed oidc')} to seed OIDC configs alone.\n`
      );
      throw new Error('Failed to get configs');
    }
  };

  const getCloudConnectionData = async () => {
    const { value } = await queryCloudConnectionData();
    const result = cloudConnectionDataGuard.safeParse(value);

    if (!result.success) {
      return;
    }

    return {
      appId: result.data.appId,
      appSecret: result.data.appSecret,
      resource: cloudApiIndicator,
    };
  };

  return { getOidcConfigs, getCloudConnectionData };
};
