import fs from 'node:fs/promises';
import path from 'node:path';

const targets = process.argv.slice(2);

if (targets.length === 0) {
  console.error('Usage: node .scripts/rm.mjs <path> [path...]');
  process.exit(1);
}

await Promise.all(
  targets.map(async (target) => {
    const resolved = path.resolve(process.cwd(), target);
    await fs.rm(resolved, { recursive: true, force: true });
  })
);

