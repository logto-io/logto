import { exec } from 'child_process';
import { existsSync } from 'fs';
import { mkdir, rename, unlink } from 'fs/promises';
import path from 'path';
import { promisify } from 'util';

import chalk from 'chalk';
import got from 'got';
import rimraf from 'rimraf';
import tar from 'tar';

import { npmPackResultGuard } from './types';

const execPromise = promisify(exec);

const fetchOfficialConnectorList = async () => {
  // Will change to "logto-io/connectors" once the new repo is ready.
  const directories = await got
    .get('https://api.github.com/repos/logto-io/logto/contents/packages')
    .json<Array<{ name: string }>>();

  return (
    directories
      // Will be removed once the new repo is ready.
      .filter(
        ({ name }) =>
          name.startsWith('connector-') &&
          name !== 'connector-core' &&
          name !== 'connector-sendgrid-mail'
      )
      .map(({ name }) => `@logto/${name}`)
  );
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
  console.log(`${chalk.blue('[add-connectors]')} Fetch official connectors list`);
  const packages = await fetchOfficialConnectorList();

  // The await inside the loop is intended for better debugging experience and rate limitation.
  for (const [index, packageName] of packages.entries()) {
    console.log(
      `${chalk.blue('[add-connectors]')} ${index + 1}/${
        packages.length
      } Adding connector package: ${packageName}`
    );
    // eslint-disable-next-line no-await-in-loop
    await addConnector(packageName, directory);
  }
};
