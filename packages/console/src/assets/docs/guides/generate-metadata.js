// This script generates the `index.ts` file for all the guides.
// It should be run from the `packages/console/src/assets/docs/guides` (current) directory.
// For conventions and specifications, see the `README.md` file in this directory.

import { existsSync } from 'node:fs';
import fs from 'node:fs/promises';

const entries = await fs.readdir('.');
const directories = entries.filter((entry) => !entry.includes('.'));

const data = await Promise.all(
  directories.map(async (directory) => {
    if (!existsSync(`${directory}/README.mdx`)) {
      console.warn(`No README.mdx file found in ${directory} directory, skipping.`);
      return;
    }

    if (!existsSync(`${directory}/index.ts`)) {
      console.warn(`No index.ts file found in ${directory} directory, skipping.`);
      return;
    }

    const logo = ['logo.webp', 'logo.svg', 'logo.png'].find((logo) => existsSync(`${directory}/${logo}`));

    const config = existsSync(`${directory}/config.json`)
      ? await import(`./${directory}/config.json`, { assert: { type: 'json' } }).then(
          (module) => module.default
        )
      : undefined;

    return {
      name: directory,
      logo,
      order: config?.order ?? Number.POSITIVE_INFINITY,
    };
  })
);
const metadata = data
  .filter(Boolean)
  .slice()
  .sort((a, b) => a.order - b.order);

const camelCase = (value) => value.replaceAll(/-./g, (x) => x[1].toUpperCase());
const filename = 'index.tsx';

await fs.writeFile(
  filename,
  "// This is a generated file, don't update manually.\n\nimport { lazy } from 'react';\n\nimport { type Guide } from './types';\n"
);

for (const { name, logo } of metadata) {
  // eslint-disable-next-line no-await-in-loop
  await fs.appendFile(filename, `import ${camelCase(name)} from './${name}/index';\n`);

  if (logo && !logo.endsWith('.svg')) {
    // eslint-disable-next-line no-await-in-loop
    await fs.appendFile(filename, `import ${camelCase(name)}Logo from './${name}/${logo}';\n`);
  }
}

await fs.appendFile(filename, '\n');
await fs.appendFile(filename, 'export const guides: Readonly<Guide[]> = Object.freeze([');

const getLogo = ({ name, logo }) => {
  if (!logo) return 'undefined';
  if (logo.endsWith('.svg')) return `lazy(async () => import('./${name}/${logo}'))`;
  return `({ className }: { readonly className?: string }) => <img src={${camelCase(name)}Logo} alt="${name}" className={className} />`;
};

for (const { name, logo, order } of metadata) {
  // eslint-disable-next-line no-await-in-loop
  await fs.appendFile(
    filename,
    `
  {
    order: ${order},
    id: '${name}',
    Logo: ${getLogo({ name, logo })},
    Component: lazy(async () => import('./${name}/README.mdx')),
    metadata: ${camelCase(name)},
  },`
  );
}

await fs.appendFile(filename, ']);\n');
