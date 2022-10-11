import path from 'path';

import { conditional } from '@silverhand/essentials';
import findUp, { exists } from 'find-up';

const findPackage = async (cwd: string) =>
  findUp(
    async (directory) => {
      const hasPackageJson = await exists(path.join(directory, 'package.json'));

      return conditional(hasPackageJson && directory);
    },
    {
      cwd,
      type: 'directory',
    }
  );
export default findPackage;
