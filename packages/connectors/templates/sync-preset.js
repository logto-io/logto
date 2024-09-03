// Merge all `package.extend.json` to the template and write to `package.json`.

import fs from 'node:fs/promises';
import path from 'node:path';

const isDependencyKey = (key) => key.toLowerCase().endsWith('dependencies');
const allowedCustomKeys = Object.freeze(['name', 'version', 'description', 'author']);

// Assuming execution context `packages/connectors`
const templateJson = Object.fromEntries(
  Object.entries(JSON.parse(await fs.readFile('templates/package.json'))).filter(
    // Filter out dependency fields since they'll be handled by the hook in `.pnpmfile.cjs`
    ([key]) => !isDependencyKey(key)
  )
);
const templateKeys = Object.keys(templateJson);

/**
 * An object that contains exceptions for scripts that are allowed to be different from the template.
 * Value format: `{ "<connector-name>": ["<script-name>"] }`
 * Example: `{ "connector-oauth2": ["prepack"] }`
 */
const scriptExceptions = { 'connector-oauth2': ['prepack', 'build', 'build:test'] };

const sync = async () => {
  const packagesDirectory = './';
  const packages = await fs.readdir(packagesDirectory);

  await Promise.all(
    packages
      .filter((packageName) => packageName.startsWith('connector-'))
      .map(async (packageName) => {
        const packageJsonPath = path.join(packagesDirectory, packageName, 'package.json');

        // Sync package.json
        const current = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

        const invalidKeys = Object.keys(current).filter(
          (key) =>
            !isDependencyKey(key) && !allowedCustomKeys.includes(key) && !templateKeys.includes(key)
        );
        if (invalidKeys.length > 0) {
          throw new Error(
            `Invalid key${invalidKeys.length === 1 ? '' : 's'} ${invalidKeys
              .map((key) => `"${key}"`)
              .join(', ')} found in ${packageName}.` +
              '\n' +
              `Allowed custom keys are: ${allowedCustomKeys.map((key) => `"${key}"`).join(', ')}.`
          );
        }

        const scriptOverrides = scriptExceptions[packageName]
          ? Object.fromEntries(
              scriptExceptions[packageName].map((key) => [key, current.scripts[key]])
            )
          : {};

        await fs.writeFile(
          packageJsonPath,
          JSON.stringify(
            {
              ...current,
              ...templateJson,
              scripts: { ...templateJson.scripts, ...scriptOverrides },
            },
            undefined,
            2
          ) + '\n'
        );

        // Copy preset
        await fs.cp('templates/preset', path.join(packagesDirectory, packageName), {
          recursive: true,
        });
      })
  );
};

await sync();
