import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

await fs.rm(path.resolve('lib'), { recursive: true, force: true });
run('pnpm', ['exec', 'tsc', '-p', 'tsconfig.build.gen.json']);
await fs.rm(path.resolve('src/db-entries'), { recursive: true, force: true });
run('node', ['lib/index.js']);

