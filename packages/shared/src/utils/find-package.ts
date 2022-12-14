import { lstat } from 'fs/promises';
import path from 'path';

import { conditional } from '@silverhand/essentials';
import { findUp, pathExists } from 'find-up';

const findPackage = async (cwd: string, allowSymlink = false) =>
  findUp(
    async (directory) => {
      const testPath = path.join(directory, 'package.json');
      const hasPackageJson = await pathExists(testPath);
      const stat = conditional(hasPackageJson && !allowSymlink && (await lstat(testPath)));

      return conditional(hasPackageJson && (allowSymlink || !stat?.isSymbolicLink()) && directory);
    },
    {
      cwd,
      type: 'directory',
    }
  );
export default findPackage;
