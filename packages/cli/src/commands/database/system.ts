import type { SystemKey } from '@logto/schemas';
import { systemGuards, systemKeys } from '@logto/schemas';
import { noop } from '@silverhand/essentials';
import chalk from 'chalk';
import type { CommandModule } from 'yargs';

import { createPoolFromConfig } from '../../database.js';
import { getRowByKey, updateValueByKey } from '../../queries/system.js';
import { log } from '../../utils.js';

const validKeysDisplay = chalk.green(systemKeys.join(', '));

type ValidateKeysFunction = {
  (keys: string[]): asserts keys is SystemKey[];
  (key: string): asserts key is SystemKey;
};

const validateKey: ValidateKeysFunction = (key) => {
  // Using `.includes()` will result a type error
  // eslint-disable-next-line unicorn/prefer-includes
  if (!systemKeys.some((element) => element === key)) {
    log.error(`Invalid config key ${chalk.red(key)} found, expected one of ${validKeysDisplay}`);
  }
};

const getConfig: CommandModule<unknown, { key: string }> = {
  command: 'get <key>',
  describe: 'Get system value of the given key in Logto database',
  builder: (yargs) =>
    yargs.positional('key', {
      describe: `The key to get from database system table, one of ${validKeysDisplay}`,
      type: 'string',
      demandOption: true,
    }),
  handler: async ({ key }) => {
    validateKey(key);

    const pool = await createPoolFromConfig();
    const row = await getRowByKey(pool, key);
    await pool.end();

    const value = row?.value;

    console.log(
      chalk.magenta(key) +
        '=' +
        (value === undefined ? chalk.gray(value) : chalk.green(JSON.stringify(value)))
    );
  },
};

const setConfig: CommandModule<unknown, { key: string; value: string }> = {
  command: 'set <key> <value>',
  describe: 'Set config value of the given key in Logto database',
  builder: (yargs) =>
    yargs
      .positional('key', {
        describe: `The key to get from database system table, one of ${validKeysDisplay}`,
        type: 'string',
        demandOption: true,
      })
      .positional('value', {
        describe: 'The value to set, should be a valid JSON string',
        type: 'string',
        demandOption: true,
      }),
  handler: async ({ key, value }) => {
    validateKey(key);

    const guarded = systemGuards[key].parse(JSON.parse(value));

    const pool = await createPoolFromConfig();
    await updateValueByKey(pool, key, guarded);
    await pool.end();

    log.info(`Update ${chalk.green(key)} succeeded`);
  },
};

const system: CommandModule = {
  command: ['system'],
  describe: 'Commands for Logto system config',
  builder: (yargs) => yargs.command(getConfig).command(setConfig).demandCommand(1),
  handler: noop,
};

export default system;
