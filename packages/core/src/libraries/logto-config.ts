import type { CloudConnectionData, JwtCustomizerType, LogtoOidcConfigType } from '@logto/schemas';
import {
  LogtoConfigs,
  LogtoJwtTokenKey,
  LogtoOidcConfigKey,
  cloudApiIndicator,
  cloudConnectionDataGuard,
  jwtCustomizerConfigGuard,
  logtoOidcConfigGuard,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import chalk from 'chalk';
import { ZodError, z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';
import { consoleLog } from '#src/utils/console.js';
import { getJwtCustomizerScripts } from '#src/utils/custom-jwt.js';

import { type CloudConnectionLibrary } from './cloud-connection.js';

export type LogtoConfigLibrary = ReturnType<typeof createLogtoConfigLibrary>;

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

  const getCloudConnectionData = async (): Promise<CloudConnectionData> => {
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
        code: 'entity.not_exists_with_id',
        name: LogtoConfigs.tableSingular,
        id: key,
        status: 404,
      });
    }

    return z.object({ value: jwtCustomizerConfigGuard[key] }).parse(rows[0]).value;
  };

  const getJwtCustomizers = async (): Promise<Partial<JwtCustomizerType>> => {
    try {
      const { rows } = await getRowsByKeys(Object.values(LogtoJwtTokenKey));

      return z
        .object(jwtCustomizerConfigGuard)
        .partial()
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

      throw new Error('Failed to get JWT customizers');
    }
  };

  const updateJwtCustomizer = async <T extends LogtoJwtTokenKey>(
    key: T,
    value: JwtCustomizerType[T]
  ): Promise<JwtCustomizerType[T]> => {
    const originValue = await getJwtCustomizer(key);
    const result = jwtCustomizerConfigGuard[key].parse({ ...originValue, ...value });
    const updatedRow = await upsertJwtCustomizer(key, result);
    return updatedRow.value;
  };

  /**
   * This method is used to deploy the give JWT customizer scripts to the cloud worker service.
   *
   * @remarks Since cloud worker service deploy all the JWT customizer scripts at once,
   * and the latest JWT customizer updates needs to be deployed ahead before saving it to the database,
   * we need to merge the input payload with the existing JWT customizer scripts.
   *
   * @params payload - The latest JWT customizer payload needs to be deployed.
   * @params payload.key - The tokenType of the JWT customizer.
   * @params payload.value - JWT customizer value
   * @params payload.isTest - Whether the JWT customizer is for test environment.
   */
  const deployJwtCustomizerScript = async <T extends LogtoJwtTokenKey>(
    cloudConnection: CloudConnectionLibrary,
    payload: {
      key: T;
      value: JwtCustomizerType[T];
      isTest?: boolean;
    }
  ) => {
    const [client, jwtCustomizers] = await Promise.all([
      cloudConnection.getClient(),
      getJwtCustomizers(),
    ]);

    const customizerScriptsFromDatabase = getJwtCustomizerScripts(jwtCustomizers);

    const newCustomizerScripts: { [key in LogtoJwtTokenKey]?: string } = {
      [payload.key]: payload.value.script,
    };

    await client.put(`/api/services/custom-jwt/worker`, {
      body: {
        production: payload.isTest
          ? customizerScriptsFromDatabase
          : { ...customizerScriptsFromDatabase, ...newCustomizerScripts },
        test: payload.isTest ? newCustomizerScripts : undefined,
      },
    });
  };

  const undeployJwtCustomizerScript = async <T extends LogtoJwtTokenKey>(
    cloudConnection: CloudConnectionLibrary,
    key: T
  ) => {
    const [client, jwtCustomizers] = await Promise.all([
      cloudConnection.getClient(),
      getJwtCustomizers(),
    ]);

    assert(jwtCustomizers[key], new RequestError({ code: 'entity.not_exists', key }));

    // Undeploy the worker directly if the only JWT customizer is being deleted.
    if (Object.entries(jwtCustomizers).length === 1) {
      await client.delete(`/api/services/custom-jwt/worker`);
      return;
    }

    // Remove the JWT customizer script from the existing JWT customizer scripts and redeploy.
    const customizerScriptsFromDatabase = getJwtCustomizerScripts(jwtCustomizers);

    await client.put(`/api/services/custom-jwt/worker`, {
      body: {
        production: {
          ...customizerScriptsFromDatabase,
          [key]: undefined,
        },
      },
    });
  };

  return {
    getOidcConfigs,
    getCloudConnectionData,
    upsertJwtCustomizer,
    getJwtCustomizer,
    getJwtCustomizers,
    updateJwtCustomizer,
    deployJwtCustomizerScript,
    undeployJwtCustomizerScript,
  };
};
