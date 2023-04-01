// Merge all `package.extend.json` to the template and write to `package.json`.

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';

import templateJson from './package.json' assert { type: "json" };

const dependencyFields = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
];

const dependencyChanged = (json1, json2) => {
  return !dependencyFields.every((field) => {
    if (typeof json1[field] !== typeof json2[field]) {
      return false;
    }

    if (typeof json1[field] !== 'object' || json1[field] === null) {
      return json1[field] === json2[field];
    }

    const composed1 = Object.entries(json1[field])
      .slice()
      .sort(([a], [b]) => a.localeCompare(b))
      .join(',');
    const composed2 = Object.entries(json2[field])
      .slice()
      .sort(([a], [b]) => a.localeCompare(b))
      .join(',');

    return composed1 === composed2;
  });
};

// Assuming execution context `packages/connectors`
const sync = async () => {
  const packagesDirectory = './';
  const packages = await fs.readdir(packagesDirectory);
  // eslint-disable-next-line @silverhand/fp/no-let
  let shouldError = false;

  // Disable `no-mutation` for easier json updates
  /* eslint-disable @silverhand/fp/no-mutation */
  await Promise.all(
    packages
      .filter((packageName) => packageName.startsWith('connector-'))
      .map(async (packageName) => {
        // Copy preset
        await fs.cp('templates/preset', path.join(packagesDirectory, packageName), {
          recursive: true,
        });

        // Sync package.json
        const extended = JSON.parse(
          await fs.readFile(
            path.join(packagesDirectory, packageName, 'package.extend.json'),
            'utf8'
          )
        );
        const result = { ...templateJson };

        for (const [key, value] of Object.entries(extended)) {
          if (key === '$schema') {
            continue;
          }

          if (Array.isArray(result[key])) {
            result[key] = [...result[key], ...value];
          } else if (typeof value === 'object' && value !== null) {
            result[key] = { ...result[key], ...value };
          } else {
            result[key] = value;
          }
        }

        const target = path.join(packagesDirectory, packageName, 'package.json');

        if (!existsSync(target)) {
          console.warn(
            `Creating ${target}. If this is a new package, run \`pnpm i\` again to update the lockfile.`
          );
        } else if (dependencyChanged(JSON.parse(await fs.readFile(target, 'utf8')), result)) {
          console.warn(`Updating dependencies of ${target}`);
          shouldError = true;
        }

        await fs.writeFile(target, JSON.stringify(result, undefined, 2) + '\n');
      })
  );
  /* eslint-enable @silverhand/fp/no-mutation */

  if (!process.argv.includes('--silent') && shouldError) {
    console.log(
      '**CONNECTOR SYNC SCRIPT**\n\nThe dependencies in `package.json` changed, run `pnpm i` again to update the lockfile.'
    );
    throw new Error('Need to run `pnpm i` again');
  }
};

await sync();
