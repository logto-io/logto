/**
 * This script runs the following tasks:
 * 
 * 1. Tag the first package of fixed version groups defined in `.changeset/config.json` and other single packages if they are not tagged with the current version in `package.json`;
 * 2. If no new git tag added, exit;
 * 3. If at least one new git tag found, run `pnpm -r publish` and `git push --tags`.
 * 
 * The subsequential release tasks, such as create GitHub release and build Docker image, will be took over by GitHub workflows.
 */

import { execSync } from 'child_process';
import { mainPackages, allPackages, singlePackages, corePackageName } from './packages-meta.js';

const taggedPackages = [...mainPackages, ...singlePackages]
  .map((packageName) => {
    const packageInfo = allPackages.find(({ name }) => name === packageName);

    if (!packageInfo) {
      throw new Error(`Package ${packageName} not found`);
    }

    const { name, version } = packageInfo;
    if (!version) {
      throw new Error(`No version found in package ${packageName}`);
    }

    const tag = name + '@' + version;
    const hasTag = Boolean(execSync(`git tag -l ${tag}`, { encoding: 'utf8' }));

    if (hasTag) {
      console.log(`Tag ${tag} exists, skipping`);
      return;
    }

    execSync(`git tag -a ${tag} -m'${tag}'`);
    console.log(`Tag ${tag} added`);

    if (packageName === corePackageName) {
      const semver = 'v' + version;
      execSync(`git tag -a ${semver} -m'${semver}'`);
      console.log(`Tag ${semver} added (SemVer of core package ${corePackageName})`);
    }

    return packageName;
  })
  .filter((value) => !!value);

if (taggedPackages.length === 0) {
  console.log('No package tagged, exiting');
  process.exit(0);
}

execSync('pnpm -r publish');
execSync('git push --follow-tags');
