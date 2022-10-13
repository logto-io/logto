import { lstat } from 'fs/promises';
import path from 'path';

import { conditional } from '@silverhand/essentials';
import findUp, { exists } from 'find-up';

const findPackage = async (cwd: string, allowSymlink = false) =>
  findUp(
    // Will update to 7 soon
    // eslint-disable-next-line complexity
    async (directory) => {
      const testPath = path.join(directory, 'package.json');
      const hasPackageJson = await exists(testPath);
      const stat = conditional(hasPackageJson && !allowSymlink && (await lstat(testPath)));

      return conditional(hasPackageJson && (allowSymlink || !stat?.isSymbolicLink()) && directory);
    },
    {
      cwd,
      type: 'directory',
    }
  );
export default findPackage;
