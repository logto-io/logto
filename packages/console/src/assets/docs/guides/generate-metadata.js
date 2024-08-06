// This script generates the `index.tsx` file for all the guides.
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
    const darkLogo = ['logo-dark.webp', 'logo-dark.svg', 'logo-dark.png'].find((logo) =>
      existsSync(`${directory}/${logo}`)
    );

    const config = existsSync(`${directory}/config.json`)
      ? await import(`./${directory}/config.json`, { assert: { type: 'json' } }).then(
          (module) => module.default
        )
      : undefined;

    return {
      name: directory,
      logo,
      darkLogo,
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
  `/* eslint-disable max-lines */
// This is a generated file, don't update manually.\n\nimport { lazy } from 'react';\n\nimport { type Guide } from './types';\n`
);

for (const { name, logo, darkLogo } of metadata) {
  // eslint-disable-next-line no-await-in-loop
  await fs.appendFile(filename, `import ${camelCase(name)} from './${name}/index';\n`);

  if (logo && !logo.endsWith('.svg')) {
    // eslint-disable-next-line no-await-in-loop
    await fs.appendFile(filename, `import ${camelCase(name)}Logo from './${name}/${logo}';\n`);
  }

  if (darkLogo && !darkLogo.endsWith('.svg')) {
    // eslint-disable-next-line no-await-in-loop
    await fs.appendFile(filename, `import ${camelCase(name)}LogoDark from './${name}/${darkLogo}';\n`);
  }
}

await fs.appendFile(filename, '\n');
await fs.appendFile(filename, 'export const guides: Readonly<Guide[]> = Object.freeze([');

const getLogo = ({ name, logo, isDark }) => {
  if (!logo) return 'undefined';
  if (logo.endsWith('.svg')) return `lazy(async () => import('./${name}/${logo}?react'))`;
  return `({ className }: { readonly className?: string }) => <img src={${camelCase(name)}Logo${isDark ? 'Dark' : ''}} alt="${name}" className={className} />`;
};

for (const { name, logo, darkLogo, order } of metadata) {
  // eslint-disable-next-line no-await-in-loop
  await fs.appendFile(
    filename,
    `
  {
    order: ${order},
    id: '${name}',
    Logo: ${getLogo({ name, logo })},
    DarkLogo: ${getLogo({ name, logo: darkLogo, isDark: true })},
    Component: lazy(async () => import('./${name}/README.mdx')),
    metadata: ${camelCase(name)},
  },`
  );
}

await fs.appendFile(filename, `]);
/* eslint-enable max-lines */\n`);
