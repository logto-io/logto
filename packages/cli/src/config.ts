import { readFile, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';

import chalk from 'chalk';
import findUp from 'find-up';
// eslint-disable-next-line id-length
import z from 'zod';

import { log } from './utilities';

// Logto config
const logtoConfigFilename = '.logto.json';
const getConfigPath = async () =>
  (await findUp(logtoConfigFilename)) ?? path.join(os.homedir(), logtoConfigFilename);

const getConfigJson = async () => {
  const configPath = await getConfigPath();

  try {
    const raw = await readFile(configPath, 'utf8');

    // Prefer `unknown` over the original return type `any`, will guard later
    // eslint-disable-next-line no-restricted-syntax
    return JSON.parse(raw) as unknown;
  } catch {}
};

const configGuard = z
  .object({
    databaseUrl: z.string().optional(),
  })
  .default({});

type LogtoConfig = z.infer<typeof configGuard>;

export const getConfig = async () => {
  return configGuard.parse(await getConfigJson());
};

export const patchConfig = async (config: LogtoConfig) => {
  const configPath = await getConfigPath();
  await writeFile(configPath, JSON.stringify({ ...(await getConfig()), ...config }, undefined, 2));
  log.info(`Updated config in ${chalk.blue(configPath)}`);
};
