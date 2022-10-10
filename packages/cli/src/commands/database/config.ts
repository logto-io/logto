import { logtoConfigGuards, LogtoConfigKey, logtoConfigKeys } from '@logto/schemas';
import { deduplicate } from '@silverhand/essentials';
import chalk from 'chalk';
import { CommandModule } from 'yargs';

import { createPoolFromEnv } from '../../database';
import { getRowsByKeys, updateValueByKey } from '../../queries/logto-config';
import { log } from '../../utilities';

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

export const getConfig: CommandModule<unknown, { key: string; keys: string[] }> = {
  command: 'get-config <key> [keys...]',
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

    const pool = await createPoolFromEnv();
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

export const setConfig: CommandModule<unknown, { key: string; value: string }> = {
  command: 'set-config <key> <value>',
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

    const pool = await createPoolFromEnv();
    await updateValueByKey(pool, key, guarded);
    await pool.end();

    log.info(`Update ${chalk.green(key)} succeeded`);
  },
};
