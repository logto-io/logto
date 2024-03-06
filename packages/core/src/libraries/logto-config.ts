import {
  LogtoConfigs,
  cloudApiIndicator,
  cloudConnectionDataGuard,
  logtoOidcConfigGuard,
  LogtoOidcConfigKey,
  jwtCustomizerConfigGuard,
} from '@logto/schemas';
import type { LogtoOidcConfigType, LogtoJwtTokenKey } from '@logto/schemas';
import { convertToIdentifiers } from '@logto/shared';
import chalk from 'chalk';
import { z, ZodError } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { consoleLog } from '#src/utils/console.js';

export type LogtoConfigLibrary = ReturnType<typeof createLogtoConfigLibrary>;
const { table } = convertToIdentifiers(LogtoConfigs);

export const createLogtoConfigLibrary = ({
  logtoConfigs: {
    getRowsByKeys,
    getCloudConnectionData: queryCloudConnectionData,
    upsertJwtCustomizer: queryUpsertJwtCustomizer,
  },
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
      throw new Error('Failed to get cloud connection data!');
    }

    return {
      appId: result.data.appId,
      appSecret: result.data.appSecret,
      resource: cloudApiIndicator,
    };
  };

  // Can not narrow down the type of value if we utilize `buildInsertIntoWithPool` method.
  const upsertJwtCustomizer = async <T extends LogtoJwtTokenKey>(
    key: T,
    value: z.infer<(typeof jwtCustomizerConfigGuard)[T]>
  ) => {
    const { value: rawValue } = await queryUpsertJwtCustomizer(key, value);

    return {
      key,
      value: jwtCustomizerConfigGuard[key].parse(rawValue),
    };
  };

  const getJwtCustomizer = async <T extends LogtoJwtTokenKey>(key: T) => {
    const { rows } = await getRowsByKeys([key]);

    // If the record does not exist (`rows` is empty)
    if (rows.length === 0) {
      throw new RequestError({
        code: 'entity.not_exists',
        name: table,
        id: key,
        status: 404,
      });
    }

    return z.object({ value: jwtCustomizerConfigGuard[key] }).parse(rows[0]);
  };

  return { getOidcConfigs, getCloudConnectionData, upsertJwtCustomizer, getJwtCustomizer };
};
