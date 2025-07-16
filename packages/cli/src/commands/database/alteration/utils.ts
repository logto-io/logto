import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { findPackage } from '@logto/shared';

import { getPathInModule } from '../../../utils.js';

import type { AlterationFile } from './type.js';

const currentDirname = path.dirname(fileURLToPath(import.meta.url));
const alterationFilenameRegex = /-([\d.]+)-?.*\.js$/;

export const getTimestampFromFilename = (filename: string) => {
  const match = alterationFilenameRegex.exec(filename);
  const timestampPart = match?.[1];

  if (!timestampPart) {
    throw new Error(`Can not get timestamp: ${filename}`);
  }

  /**
   * We support the timestamp with or without a suffix.
   *
   * - `next-1663923770-a.js`
   * - `next-1663923770.1-c.js`
   */
  const [baseTimestamp] = timestampPart.split('.');

  /**
   * Validate the baseTimestamp digit length. The timestamp should be formatted in second precision.
   *
   * E.g. Math.ceil(Date.now() / 1000)
   *
   * Should Throw an error if the timestamp is greater than 10 digits.
   * This is to ensure that the timestamp is in seconds, not milliseconds.
   */
  if (!baseTimestamp || baseTimestamp.length > 10) {
    throw new Error(`Invalid timestamp format in filename: ${filename}`);
  }

  return Number(timestampPart);
};

export const getAlterationDirectory = () => getPathInModule('@logto/schemas', 'alterations-js');

export const getAlterationFiles = async (): Promise<AlterationFile[]> => {
  const alterationDirectory = getAlterationDirectory();

  /**
   * We copy all alteration scripts to the CLI package root directory,
   * since they need a proper context that includes required dependencies (such as slonik) in `node_modules/`.
   * While the original `@logto/schemas` may remove them in production.
   */
  const packageDirectory = await findPackage(currentDirname);

  const localAlterationDirectory = path.resolve(
    packageDirectory ?? currentDirname,
    'alteration-scripts'
  );

  if (!existsSync(alterationDirectory)) {
    return [];
  }

  // We need to copy alteration files to execute in the CLI context to make `slonik` available
  // Notice that we don't remove the folder,
  // this ensures that the writabiliy remains (and also allows this to be a separately-mounted directory.
  if (!existsSync(localAlterationDirectory)) {
    await fs.mkdir(localAlterationDirectory, { recursive: true });
  }

  const oldFiles = await fs.readdir(localAlterationDirectory);
  await Promise.all(
    oldFiles.map(async (file) =>
      fs.rm(path.join(localAlterationDirectory, file), { force: true, recursive: true })
    )
  );
  const newFiles = await fs.readdir(alterationDirectory);
  await Promise.all(
    newFiles.map(async (file) =>
      fs.cp(path.join(alterationDirectory, file), path.join(localAlterationDirectory, file), {
        recursive: true,
        preserveTimestamps: true,
      })
    )
  );

  const directory = await fs.readdir(localAlterationDirectory);
  const files = directory.filter((file) => alterationFilenameRegex.test(file));

  return files
    .slice()
    .sort((file1, file2) => getTimestampFromFilename(file1) - getTimestampFromFilename(file2))
    .map((filename) => ({ path: path.join(localAlterationDirectory, filename), filename }));
};

export const chooseRevertAlterationsByTimestamp = async (target: string) => {
  const files = await getAlterationFiles();
  const targetTimestamp = Number(target);

  if (Number.isNaN(targetTimestamp)) {
    return [];
  }

  return files.filter(({ filename }) => getTimestampFromFilename(filename) > targetTimestamp);
};
