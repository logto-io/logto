import { exec } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, rename, unlink } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import rimraf from 'rimraf';
import tar from 'tar';
import { z } from 'zod';

import { npmPackResultGuard } from './types';

const execPromise = promisify(exec);
const npmConnectorFilter = '@logto/connector-';

const fetchOfficialConnectorList = async () => {
  const { stdout } = await execPromise(`npm search ${npmConnectorFilter} --json`);
  const packages = z.object({ name: z.string() }).array().parse(JSON.parse(stdout));

  return packages.filter(({ name }) => !name.includes('mock') && !name.includes('core'));
};

export const addConnector = async (packageName: string, cwd: string) => {
  if (!existsSync(cwd)) {
    await mkdir(cwd);
  }
  const { stdout } = await execPromise(`npm pack ${packageName} --json`, { cwd });
  const result = npmPackResultGuard.parse(JSON.parse(stdout));

  if (!result[0]) {
    throw new Error(`Failed to download package: ${packageName}`);
  }

  const { filename, name } = result[0];
  const escapedFilename = filename.replace(/\//g, '-').replace(/@/g, '');
  const filePath = path.join(cwd, escapedFilename);
  await tar.extract({ cwd, file: filePath });
  await unlink(filePath);

  const packageFolder = path.join(cwd, name.replace(/\//g, '-').replace(/@/g, ''));
  await promisify(rimraf)(packageFolder);

  await rename(path.join(cwd, 'package'), packageFolder);
};

export const addOfficialConnectors = async (directory: string) => {
  console.log(`${chalk.blue('[add-connectors]')} Fetching official connectors list`);
  const packages = await fetchOfficialConnectorList();

  // The await inside the loop is intended for better debugging experience and rate limitation.
  for (const [index, { name }] of packages.entries()) {
    console.log(
      `${chalk.blue('[add-connectors]')} ${index + 1}/${
        packages.length
      } Adding connector package: ${name}`
    );
    // eslint-disable-next-line no-await-in-loop
    await addConnector(name, directory);
  }
};
