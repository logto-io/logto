const { execSync } = require('child_process');
const changesetConfig = require('../.changeset/config.json');

/** @type {Array<{ name: string; version?: string; path: string; private: boolean; }>} */
const allPackages = JSON.parse(execSync('pnpm recursive list --depth=-1 --json', { encoding: 'utf8' }));
const mainPackages = [...changesetConfig.fixed, ...changesetConfig.linked].map(([first]) => first);

const taggedPackages = mainPackages
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
    return packageName;
  })
  .filter((value) => !!value);

if (taggedPackages.length === 0) {
  console.log('No package tagged, exiting');
  process.exit(0);
}

execSync('pnpm -r publish');
execSync('git push --tags');
