import type { LogtoConfigKey } from '@logto/schemas';
import { LogtoOidcConfigKey, logtoConfigGuards, logtoConfigKeys } from '@logto/schemas';
import { deduplicate, noop } from '@silverhand/essentials';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { createPoolFromConfig } from '../../database';
import { getRowsByKeys, updateValueByKey } from '../../queries/logto-config';
import { log } from '../../utilities';
import { generateOidcCookieKey, generateOidcPrivateKey } from './utilities';

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
    log.error(
      `Invalid config key ${chalk.red(invalidKey)} found, expected one of ${validKeysDisplay}`
    );
  }
};

const validRotateKeys = Object.freeze([
  LogtoOidcConfigKey.PrivateKeys,
  LogtoOidcConfigKey.CookieKeys,
] as const);

type ValidateRotateKeyFunction = (key: string) => asserts key is typeof validRotateKeys[number];

const validateRotateKey: ValidateRotateKeyFunction = (key) => {
  // Using `.includes()` will result a type error
  // eslint-disable-next-line unicorn/prefer-includes
  if (!validRotateKeys.some((element) => element === key)) {
    log.error(`Invalid config key ${chalk.red(key)} found, expected one of ${validKeysDisplay}`);
  }
};

const getConfig: CommandModule<unknown, { key: string; keys: string[] }> = {
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
      }),
  handler: async ({ key, keys }) => {
    const queryKeys = deduplicate([key, ...keys]);
    validateKeys(queryKeys);

    const pool = await createPoolFromConfig();
    const { rows } = await getRowsByKeys(pool, queryKeys);
    await pool.end();

    console.log(
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

const setConfig: CommandModule<unknown, { key: string; value: string }> = {
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
      }),
  handler: async ({ key, value }) => {
    validateKeys(key);

    const guarded = logtoConfigGuards[key].parse(JSON.parse(value));

    const pool = await createPoolFromConfig();
    await updateValueByKey(pool, key, guarded);
    await pool.end();

    log.info(`Update ${chalk.green(key)} succeeded`);
  },
};

const rotateConfig: CommandModule<unknown, { key: string }> = {
  command: 'rotate <key>',
  describe:
    'Generate a new private or secret key for the given config key and prepend to the key array',
  builder: (yargs) =>
    yargs.positional('key', {
      describe: `The key to rotate, one of ${chalk.green(validRotateKeys.join(', '))}`,
      type: 'string',
      demandOption: true,
    }),
  handler: async ({ key }) => {
    validateRotateKey(key);

    const pool = await createPoolFromConfig();
    const { rows } = await getRowsByKeys(pool, [key]);

    if (!rows[0]) {
      log.warn('No key found, create a new one');
    }

    const getValue = async () => {
      const parsed = logtoConfigGuards[key].safeParse(rows[0]?.value);
      const original = parsed.success ? parsed.data : [];

      // No need for default. It's already exhaustive
      // eslint-disable-next-line default-case
      switch (key) {
        case LogtoOidcConfigKey.PrivateKeys:
          return [await generateOidcPrivateKey(), ...original];
        case LogtoOidcConfigKey.CookieKeys:
          return [generateOidcCookieKey(), ...original];
      }
    };
    const rotated = await getValue();
    await updateValueByKey(pool, key, rotated);
    await pool.end();

    log.info(`Rotate ${chalk.green(key)} succeeded, now it has ${rotated.length} keys`);
  },
};

const config: CommandModule = {
  command: ['config', 'configs'],
  describe: 'Commands for Logto database config',
  builder: (yargs) =>
    yargs.command(getConfig).command(setConfig).command(rotateConfig).demandCommand(1),
  handler: noop,
};

export default config;
