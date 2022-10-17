import { conditional } from '@silverhand/essentials';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { SemVer, compare, eq, gt } from 'semver';

import { findLastIndex, log } from '../../../utilities';
import { AlterationFile } from './type';

const getVersionFromFilename = (filename: string) => {
  try {
    return new SemVer(filename.split('-')[0]?.replaceAll('_', '-') ?? 'unknown');
  } catch {}
};

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

    log.info(`Deploy target ${chalk.green(nextTag)}`);

    return alterations.slice(0, endIndex);
  }

  const versions = alterations
    .map(({ filename }) => getVersionFromFilename(filename))
    .filter((version): version is SemVer => version instanceof SemVer)
    // Cannot use `Set` to deduplicate since it's a class
    .filter((version, index, self) => index === self.findIndex((another) => eq(version, another)))
    .slice()
    .sort((i, j) => compare(j, i));
  const initialSemVersion = conditional(initialVersion && new SemVer(initialVersion));

  if (!versions[0]) {
    return [];
  }

  const { version: targetVersion } =
    initialVersion === latestTag
      ? { version: versions[0] }
      : await inquirer.prompt<{ version: SemVer }>(
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

  log.info(`Deploy target ${chalk.green(targetVersion.version)}`);

  return alterations.filter(({ filename }) => {
    const version = getVersionFromFilename(filename);

    return version && !gt(version, targetVersion);
  });
};
