# Guides

> This directory is a part of the guide v2 project. The sibling directory `tutorial` will be removed once the guide v2 project is complete.

This directory serves as the home for all guides related to the console. Every guide should have a directory with the following structure:

```
[target]-name
├── assets
│   └── image-name.png
├── index.ts
├── logo.svg
└── README.mdx
```

The `README.mdx` file contains the actual guide content. The `assets` directory contains all images used in the guide. The `index.ts` file exports the guide's metadata, which is used to display, sort and filter the guides in the console.

## Write a guide

### Create the guide directory

The guide directory should be named `[target]-name`, where `[target]` is the target of the guide in kebab-case and `name` is the name of the guide. The name should be kebab-cased and should not contain any special characters.

Currently we have the following targets:

- `spa`: Single-page application
- `web`: Web application
- `native`: Native application
- `m2m`: Machine-to-machine
- `api`: API resource

For example, a guide for the `MachineToMachine` target with the name `General` should be placed in the directory `m2m-general`; a guide for the `SPA` target with the name `React` should be placed in the directory `spa-react`.

> **Note**
> The directory name will be the unique identifier of the guide.

### Create the guide metadata

The guide metadata should be the default export of the `index.ts` file. It should be an object with the `GuideMetadata` type in `types.ts` as its type.

### Write the guide content

The guide content is written in [MDX](https://mdxjs.com/), which is a combination of Markdown and JSX. This allows us to use React components in the guide content.

### Add the logo

The logo should be placed in the guide directory and named `logo.svg`. It will be displayed in the guide list and other places where the guide is referenced.

### Add images and other assets

Images and other assets (if any) should be placed in the `assets` directory of the guide. They can then be referenced in the guide content.

### Update metadata

Since Parcel doesn't support dynamic import (see [#112](https://github.com/parcel-bundler/parcel/issues/112) [#125](https://github.com/parcel-bundler/parcel/issues/125)), we need to run `node generate-metadata.js` to update the metadata in `index.ts`, thus we can use it in the guide components with React lazy loading.

This may be fixed by replacing Parcel with something else.

### Order guides

The guides are ordered by the following rules in ascending order:

1. The `order` property of all guides across all category groups
2. The sorting order should exactly follow the order in UX design. E.g. Next.js being the 1st one, React being the 2nd
3. The guides in featured group ("Popular and for you") should have `1.x` order value
4. The guides that are not listed in featured group can have order value equal to or greater than 2

You can configure the property by creating a `config.json` file in the guide directory. The file should be an object with the following structure:

```json
{
  "order": 1
}
```

If no `config.json` file is found, the guide will be placed at the end of the list.
