import { spawnSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

const run = (command, args) => {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: true });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
};

await fs.rm(path.resolve('scripts-js'), { recursive: true, force: true });
run('pnpm', ['exec', 'tsc', '-p', 'tsconfig.scripts.gen.json']);
await fs.rm(path.resolve('src/consts/jwt-customizer-type-definition.ts'), { force: true });
run('node', ['scripts-js/generate-jwt-customizer-type-definition.js']);
await fs.rm(path.resolve('scripts-js'), { recursive: true, force: true });

