import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

const cmd = ['pnpm changeset version', ...process.argv.slice(2)].join(' ');

const catchCmdError = ({ stderr, stdout, code }) => {
  console.log(stdout);
  console.error(stderr);
  process.exit(code ?? 1);
};

console.log(cmd);

await execAsync(cmd).catch(catchCmdError);

// Manually run lifecycle script since changesets didn't
await execAsync(`pnpm -r version`).catch(catchCmdError);

// Sanity check for prepublish scripts
await execAsync(`pnpm -r prepack`).catch(catchCmdError);

// Note: We deliberately move the lockfile update before `prepublishOnly` to ensure the lockfile
// is always updated after version bump and before publishing, so that Docker build and other CI
// tasks can always get the latest lockfile. This is required for `@logto/api` package which has
// Docker Compose file and needs to be built in CI.

// Update lockfile
await execAsync(`pnpm i --no-frozen-lockfile`).catch(catchCmdError);

// Sanity check for prepublish scripts
await execAsync(`pnpm -r prepublishOnly`).catch(catchCmdError);

// Show Git changes
await execAsync(`git status`).catch(catchCmdError);
