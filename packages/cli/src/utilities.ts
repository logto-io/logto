import { execSync } from 'child_process';
import { createWriteStream } from 'fs';
import { readFile } from 'fs/promises';
import os from 'os';
import path from 'path';

import chalk from 'chalk';
import findUp from 'find-up';
import got, { Progress } from 'got';
import { HttpsProxyAgent } from 'hpagent';
import ora from 'ora';
// eslint-disable-next-line id-length
import z from 'zod';

export const safeExecSync = (command: string) => {
  try {
    return execSync(command, { encoding: 'utf8', stdio: 'pipe' });
  } catch {}
};

type Log = Readonly<{
  info: typeof console.log;
  warn: typeof console.log;
  error: typeof console.log;
}>;

export const log: Log = Object.freeze({
  info: (...args) => {
    console.log(chalk.blue('[info]'), ...args);
  },
  warn: (...args) => {
    console.log(chalk.yellow('[warn]'), ...args);
  },
  error: (...args) => {
    console.log(chalk.red('[error]'), ...args);
    // eslint-disable-next-line unicorn/no-process-exit
    process.exit(1);
  },
});

export const downloadFile = async (url: string, destination: string) => {
  const { HTTPS_PROXY, HTTP_PROXY, https_proxy, http_proxy } = process.env;
  const file = createWriteStream(destination);
  const proxy = HTTPS_PROXY ?? https_proxy ?? HTTP_PROXY ?? http_proxy;
  const stream = got.stream(url, {
    ...(proxy && { agent: { https: new HttpsProxyAgent({ proxy }) } }),
  });
  const spinner = ora({
    text: 'Connecting',
    prefixText: chalk.blue('[info]'),
  }).start();

  stream.pipe(file);

  return new Promise((resolve, reject) => {
    stream.on('downloadProgress', ({ total, percent }: Progress) => {
      if (!total) {
        return;
      }

      // eslint-disable-next-line @silverhand/fp/no-mutation
      spinner.text = `${(percent * 100).toFixed(1)}%`;
    });

    file.on('error', (error) => {
      spinner.fail();
      reject(error.message);
    });

    file.on('finish', () => {
      file.close();
      spinner.succeed();
      resolve(file);
    });
  });
};

// Intended
// eslint-disable-next-line @typescript-eslint/no-empty-function
export const noop = () => {};

// Logto config
const logtoConfig = '.logto.json';

const getConfigJson = async () => {
  const configPath = (await findUp(logtoConfig)) ?? path.join(os.homedir(), logtoConfig);

  try {
    const raw = await readFile(configPath, 'utf8');

    // Prefer `unknown` over the original return type `any`, will guard later
    // eslint-disable-next-line no-restricted-syntax
    return JSON.parse(raw) as unknown;
  } catch {}
};

export const getConfig = async () => {
  return z
    .object({
      databaseUrl: z.string().optional(),
    })
    .default({})
    .parse(await getConfigJson());
};
