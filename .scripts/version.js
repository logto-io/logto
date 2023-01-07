import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const versionGroup = process.argv[2];

if (process.argv.length > 3) {
  throw new Error('Extraneous arguments found. Only one optional argument for version group name is allowed.');
}

// This is configured based on our practice. Change with care.
// Should be synced with `/.github/workflows/changesets.yml`
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

const catchCmdError = ({ stderr, stdout, code }) => {
  console.log(stdout);
  console.error(stderr);
  process.exit(code ?? 1);
};

console.log(cmd);

await execAsync(cmd).catch(catchCmdError);

// Manually run lifecycle script since changesets didn't
await execAsync('pnpm -r version').catch(catchCmdError);

// Sanity check for prepublish scripts
await execAsync('pnpm -r prepublishOnly').catch(catchCmdError);
