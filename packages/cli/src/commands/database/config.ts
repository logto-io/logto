import type { LogtoConfigKey } from '@logto/schemas';
import {
  defaultTenantId,
  LogtoOidcConfigKey,
  logtoConfigGuards,
  logtoConfigKeys,
  SupportedSigningKeyAlgorithm,
} from '@logto/schemas';
import { deduplicate, noop } from '@silverhand/essentials';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { createPoolFromConfig } from '../../database.js';
import { getRowsByKeys, updateValueByKey } from '../../queries/logto-config.js';
import { consoleLog } from '../../utils.js';

import {
  getEffectiveRotationGracePeriod,
  rotateConfigKey,
  trimConfigKey,
} from './config-rotation.js';

const validKeysDisplay = chalk.green(logtoConfigKeys.join(', '));

type ValidateKeysFunction = {
  (keys: string[]): asserts keys is LogtoConfigKey[];
  (key: string): asserts key is LogtoConfigKey;
};

const validateKeys: ValidateKeysFunction = (keys) => {
  const invalidKey = (Array.isArray(keys) ? keys : [keys]).find(
    // Using `.includes()` will result a type error
    // eslint-disable-next-line unicorn/prefer-includes
    (key) => !logtoConfigKeys.some((element) => element === key)
  );

  if (invalidKey) {
    consoleLog.fatal(
      `Invalid config key ${chalk.red(invalidKey)} found, expected one of ${validKeysDisplay}`
    );
  }
};

const validRotateKeys = Object.freeze([
  LogtoOidcConfigKey.PrivateKeys,
  LogtoOidcConfigKey.CookieKeys,
] as const);

const validPrivateKeyTypes = Object.freeze([
  SupportedSigningKeyAlgorithm.RSA,
  SupportedSigningKeyAlgorithm.EC,
] as const);

type ValidateRotateKeyFunction = (key: string) => asserts key is (typeof validRotateKeys)[number];

type ValidatePrivateKeyTypeFunction = (
  key: string
) => asserts key is (typeof validPrivateKeyTypes)[number];

const validateRotateKey: ValidateRotateKeyFunction = (key) => {
  // Using `.includes()` will result a type error
  // eslint-disable-next-line unicorn/prefer-includes
  if (!validRotateKeys.some((element) => element === key)) {
    consoleLog.fatal(
      `Invalid config key ${chalk.red(key)} found, expected one of ${validKeysDisplay}`
    );
  }
};

const validatePrivateKeyType: ValidatePrivateKeyTypeFunction = (key) => {
  // Using `.includes()` will result a type error
  // eslint-disable-next-line unicorn/prefer-includes
  if (!validPrivateKeyTypes.some((element) => element === key)) {
    consoleLog.fatal(
      `Invalid private key type ${chalk.red(
        key
      )} found, expected one of ${validPrivateKeyTypes.join(', ')}`
    );
  }
};

const getValidatedPrivateKeyType = (key: string): SupportedSigningKeyAlgorithm => {
  validatePrivateKeyType(key);

  return key;
};

const getConfig: CommandModule<unknown, { key: string; keys: string[]; tenantId: string }> = {
  command: 'get <key> [keys...]',
  describe: 'Get config value(s) of the given key(s) in Logto database',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The key to get from database, one of ${validKeysDisplay}`,
        type: 'string',
        demandOption: true,
      })
      .positional('keys', {
        describe: 'The additional keys to get from database',
        type: 'string',
        array: true,
        default: [],
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      }),
  handler: async ({ key, keys, tenantId }) => {
    const queryKeys = deduplicate([key, ...keys]);
    validateKeys(queryKeys);

    const pool = await createPoolFromConfig();
    const { rows } = await getRowsByKeys(pool, tenantId, queryKeys);
    await pool.end();

    consoleLog.plain(
      queryKeys
        .map((currentKey) => {
          const value = rows.find(({ key }) => currentKey === key)?.value;

          return (
            chalk.magenta(currentKey) +
            '=' +
            (value === undefined ? chalk.gray(value) : chalk.green(JSON.stringify(value)))
          );
        })
        .join('\n')
    );
  },
};

const setConfig: CommandModule<unknown, { key: string; value: string; tenantId: string }> = {
  command: 'set <key> <value>',
  describe: 'Set config value of the given key in Logto database',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The key to get from database, one of ${validKeysDisplay}`,
        type: 'string',
        demandOption: true,
      })
      .positional('value', {
        describe: 'The value to set, should be a valid JSON string',
        type: 'string',
        demandOption: true,
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      }),
  handler: async ({ key, value, tenantId }) => {
    validateKeys(key);

    const guarded = logtoConfigGuards[key].parse(JSON.parse(value));

    const pool = await createPoolFromConfig();
    await updateValueByKey(pool, tenantId, key, guarded);
    await pool.end();

    consoleLog.info(`Update ${chalk.green(key)} succeeded`);
  },
};

const rotateConfig: CommandModule<
  unknown,
  { key: string; tenantId: string; type: string; gracePeriod?: number }
> = {
  command: 'rotate <key>',
  describe:
    'Generate a new private or secret key for the given config key and update the key state',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The key to rotate, one of ${chalk.green(validRotateKeys.join(', '))}`,
        type: 'string',
        demandOption: true,
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      })
      .option('type', {
        describe: `The key type for ${
          LogtoOidcConfigKey.PrivateKeys
        }, one of ${validPrivateKeyTypes.join(', ')}`,
        type: 'string',
        default: 'ec',
      })
      .option('gracePeriod', {
        describe: `Grace period in seconds for ${LogtoOidcConfigKey.PrivateKeys} staged rotation`,
        type: 'number',
      }),
  handler: async ({ key, tenantId, type, gracePeriod }) => {
    const keyType = type.toUpperCase();
    const privateKeyType =
      key === LogtoOidcConfigKey.PrivateKeys
        ? getValidatedPrivateKeyType(keyType)
        : SupportedSigningKeyAlgorithm.EC;
    validateRotateKey(key);

    const effectiveGracePeriod = (() => {
      try {
        return getEffectiveRotationGracePeriod({
          key,
          gracePeriod,
          envGracePeriod: process.env.PRIVATE_KEY_ROTATION_GRACE_PERIOD,
        });
      } catch (error) {
        return consoleLog.fatal(
          error instanceof Error ? error.message : 'Invalid grace period provided'
        );
      }
    })();

    const pool = await createPoolFromConfig();
    const { keys: rotated } = await pool.transaction(async (connection) =>
      rotateConfigKey({
        connection,
        tenantId,
        key,
        privateKeyType,
        gracePeriod: effectiveGracePeriod,
      })
    );
    await pool.end();

    consoleLog.info(`Rotate ${chalk.green(key)} succeeded, now it has ${rotated.length} keys`);
  },
};

const trimConfig: CommandModule<unknown, { key: string; length: number; tenantId: string }> = {
  command: 'trim <key> [length]',
  describe: 'Remove the last [length] number of private or secret keys for the given config key',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The config key to trim, one of ${chalk.green(validRotateKeys.join(', '))}`,
        type: 'string',
        demandOption: true,
      })
      .positional('length', {
        describe: 'Number of private or secret keys to trim',
        type: 'number',
        default: 1,
        demandOption: true,
      })
      .option('tenantId', {
        describe: 'The tenant to operate',
        type: 'string',
        default: defaultTenantId,
      }),
  handler: async ({ key, length, tenantId }) => {
    validateRotateKey(key);

    if (length < 1) {
      consoleLog.fatal('Invalid length provided');
    }

    const pool = await createPoolFromConfig();
    const { keys: trimmed } = await pool.transaction(async (connection) =>
      trimConfigKey({
        connection,
        tenantId,
        key,
        length,
      })
    );
    await pool.end();

    consoleLog.info(`Trim ${chalk.green(key)} succeeded, now it has ${trimmed.length} keys`);
  },
};

const config: CommandModule = {
  command: ['config', 'configs'],
  describe: 'Commands for Logto database config',
  builder: (yargs) =>
    yargs
      .command(getConfig)
      .command(setConfig)
      .command(rotateConfig)
      .command(trimConfig)
      .demandCommand(1),
  handler: noop,
};

export default config;
