import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const versionGroup = process.argv[2];

if (process.argv.length > 3) {
  throw new Error('Extraneous arguments found. Only one optional argument for version group name is allowed.');
}

// This is configured based on our practice. Change with care.
const allowedGroups = { core: 'core', toolkit: 'toolkit' };
if (!Object.values(allowedGroups).includes(versionGroup)) {
  throw new Error('Version group is invalid. Should be one of ' + Object.values(allowedGroups).join(', ') + '.');
}

const { allPackages } = await import('./packages-meta.js');

const getIgnoreGroup = () => {
  console.log(`=== Versioning ${versionGroup} group packages ===`);

  return allPackages.filter(({ path }) => {
    if (versionGroup === allowedGroups.toolkit) {
      return !path.includes(allowedGroups.toolkit + '/');
    }

    return false;
  });
}

const ignoreCmd = getIgnoreGroup()
  .map(({ name }) => ` \\\n  --ignore ${name}`)
  .join('');
const cmd = ('pnpm changeset version' + ignoreCmd);

console.log(cmd);

await execAsync(cmd).catch(({ stderr, code }) => {
  console.error(stderr);
  process.exit(code ?? 1);
});
