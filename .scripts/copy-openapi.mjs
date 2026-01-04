import fs from 'node:fs/promises';
import path from 'node:path';

const [fromArg, toArg] = process.argv.slice(2);

if (!fromArg || !toArg) {
  console.error('Usage: node .scripts/copy-openapi.mjs <fromDir> <toDir>');
  process.exit(1);
}

const fromDir = path.resolve(process.cwd(), fromArg);
const toDir = path.resolve(process.cwd(), toArg);

const ensureDir = async (dirPath) => {
  await fs.mkdir(dirPath, { recursive: true });
};

const copyOpenapi = async (currentFrom) => {
  let entries;
  try {
    entries = await fs.readdir(currentFrom, { withFileTypes: true });
  } catch {
    // Source dir might not exist yet; keep behavior lenient like rsync.
    return;
  }

  await Promise.all(
    entries.map(async (entry) => {
      const entryFrom = path.join(currentFrom, entry.name);
      const relative = path.relative(fromDir, entryFrom);
      const entryTo = path.join(toDir, relative);

      if (entry.isDirectory()) {
        await copyOpenapi(entryFrom);
        return;
      }

      if (!entry.isFile() || !entry.name.endsWith('.openapi.json')) {
        return;
      }

      await ensureDir(path.dirname(entryTo));
      await fs.copyFile(entryFrom, entryTo);
    })
  );
};

await ensureDir(toDir);
await copyOpenapi(fromDir);

