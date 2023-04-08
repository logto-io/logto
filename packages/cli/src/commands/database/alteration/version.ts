import { assert, conditional } from '@silverhand/essentials';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { SemVer, compare, eq, gt } from 'semver';

import { consoleLog, findLastIndex, isTty } from '../../../utils.js';

import type { AlterationFile } from './type.js';

const getVersionStringFromFilename = (filename: string) =>
  filename.split('-')[0]?.replaceAll('_', '-') ?? 'unknown';

const getVersionFromFilename = (filename: string) => {
  try {
    return new SemVer(getVersionStringFromFilename(filename));
  } catch {}
};

const getAlterationVersions = (alterations: readonly AlterationFile[]) =>
  alterations
    .map(({ filename }) => getVersionFromFilename(filename))
    .filter((version): version is SemVer => version instanceof SemVer)
    // Cannot use `Set` to deduplicate since it's a class
    .filter((version, index, self) => index === self.findIndex((another) => eq(version, another)))
    .slice()
    .sort((i, j) => compare(j, i));

const latestTag = 'latest';
const nextTag = 'next';

export const chooseAlterationsByVersion = async (
  alterations: readonly AlterationFile[],
  initialVersion?: string
) => {
  if (initialVersion === nextTag) {
    const endIndex = findLastIndex(
      alterations,
      ({ filename }) =>
        filename.startsWith(nextTag + '-') || Boolean(getVersionFromFilename(filename))
    );

    if (endIndex === -1) {
      return [];
    }

    consoleLog.info(`Deploy target ${chalk.green(nextTag)}`);

    return alterations.slice(0, endIndex + 1);
  }

  const versions = getAlterationVersions(alterations);
  const initialSemVersion = conditional(
    initialVersion && initialVersion !== latestTag && new SemVer(initialVersion)
  );
  const firstVersion = versions[0];

  if (!firstVersion) {
    return [];
  }

  const getTargetVersion = async () => {
    if (initialVersion === latestTag) {
      return firstVersion;
    }

    if (!isTty()) {
      assert(initialSemVersion, new Error('Missing target version'));

      return initialSemVersion;
    }

    const { version } = await inquirer.prompt<{ version: SemVer }>(
      {
        type: 'list',
        message: 'Choose the alteration target version',
        name: 'version',
        choices: versions.map((semVersion) => ({
          name: semVersion.version,
          value: semVersion,
        })),
      },
      {
        version: initialSemVersion,
      }
    );

    return version;
  };

  const targetVersion = await getTargetVersion();

  consoleLog.info(`Deploy target ${chalk.green(targetVersion.version)}`);

  return alterations.filter(({ filename }) => {
    const version = getVersionFromFilename(filename);

    return version && !gt(version, targetVersion);
  });
};

export const chooseRevertAlterationsByVersion = async (
  alterations: readonly AlterationFile[],
  version: string
) => {
  const semVersion = new SemVer(version);

  consoleLog.info(`Revert target ${chalk.green(semVersion.version)}`);

  return alterations.filter(({ filename }) => {
    if (getVersionStringFromFilename(filename) === nextTag) {
      return true;
    }

    const version = getVersionFromFilename(filename);

    return version && gt(version, semVersion);
  });
};
