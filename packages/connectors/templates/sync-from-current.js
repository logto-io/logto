// Sync limited info of all `package.json` to `package.extend.json`.

import fs from 'node:fs/promises';
import path from 'node:path';

// Assuming execution context `packages/connectors`
const sync = async () => {
  const packagesDirectory = './';
  const packages = await fs.readdir(packagesDirectory);

  await Promise.all(
    packages
      .filter((packageName) => packageName.startsWith('connector-'))
      .map(async (packageJson) => {
        const current = JSON.parse(
          await fs.readFile(path.join(packagesDirectory, packageJson, 'package.json'), 'utf8')
        );
        const extendPath = path.join(packagesDirectory, packageJson, 'package.extend.json');
        const extended = JSON.parse(await fs.readFile(extendPath, 'utf8'));

        // eslint-disable-next-line @silverhand/fp/no-mutation
        extended.version = current.version;

        await fs.writeFile(extendPath, JSON.stringify(extended, undefined, 2) + '\n');
      })
  );
};

await sync();
