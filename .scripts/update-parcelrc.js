import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs/promises';

if (!process.arch.startsWith('arm')) {
  process.exit(0);
}

execSync('rm packages/**/.parcelrc');

const updateParcelRcArm64 = async (dir) => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      await updateParcelRcArm64(path.resolve(dir, dirent.name));
    } else if (dirent.name === '.parcelrc.arm64') {
      await fs.rename(path.resolve(dir, dirent.name), path.resolve(dir, '.parcelrc'));
    }
  }
};

await updateParcelRcArm64(path.resolve('packages'));
