// This script generates the `index.ts` file for all the guides.
// It should be run from the `packages/console/src/assets/docs/guides` (current) directory.
// For conventions and specifications, see the `README.md` file in this directory.

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';

const entries = await fs.readdir('.');
const directories = entries.filter((entry) => !entry.includes('.'));

const metadata = directories
  .map((directory) => {
    if (!existsSync(`${directory}/README.mdx`)) {
      console.warn(`No README.mdx file found in ${directory} directory, skipping.`);
      return;
    }

    if (!existsSync(`${directory}/index.ts`)) {
      console.warn(`No index.ts file found in ${directory} directory, skipping.`);
      return;
    }

    // Add `.png` later
    const logo = ['logo.svg'].find((logo) => existsSync(`${directory}/${logo}`));

    return {
      name: directory,
      logo,
    };
  })
  .filter(Boolean);

const camelCase = (value) => value.replaceAll(/-./g, (x) => x[1].toUpperCase());
const filename = 'index.ts';

await fs.writeFile(
  filename,
  "// This is a generated file, don't update manually.\n\nimport { lazy } from 'react';\n\nimport { type Guide } from './types';\n"
);

for (const { name } of metadata) {
  // eslint-disable-next-line no-await-in-loop
  await fs.appendFile(filename, `import ${camelCase(name)} from './${name}/index';\n`);
}

await fs.appendFile(filename, '\n');
await fs.appendFile(filename, 'const guides: Readonly<Guide[]> = Object.freeze([');

for (const { name, logo } of metadata) {
  fs.appendFile(
    filename,
    `
  {
    id: '${name}',
    Logo: ${logo ? `lazy(async () => import('./${name}/${logo}'))` : 'undefined'},
    Component: lazy(async () => import('./${name}/README.mdx')),
    metadata: ${camelCase(name)},
  },
`
  );
}

await fs.appendFile(filename, ']);\n\nexport default guides;\n');
