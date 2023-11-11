import fs from 'node:fs/promises';
import path from 'node:path';

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

/**
 * Get the root component name from the given absolute path.
 * @example '/organization/:id' -> 'organization'
 */
export const getRootComponent = (path?: string) => path?.split('/')[1];

/**
 * Build a tag name from the given absolute path. The tag name is the sentence case of the root
 * component name.
 * @example '/organization-roles' -> 'Organization roles'
 */
export const buildTag = (path: string) => {
  const rootComponent = (getRootComponent(path) ?? 'General').replaceAll('-', ' ');
  return rootComponent.startsWith('.')
    ? capitalize(rootComponent.slice(1))
    : capitalize(rootComponent);
};

/**
 * Recursively find all supplement files (files end with `.openapi.json`) for the given
 * directory.
 */
/* eslint-disable @silverhand/fp/no-mutating-methods, no-await-in-loop */
export const findSupplementFiles = async (directory: string) => {
  const result: string[] = [];

  for (const file of await fs.readdir(directory)) {
    const stats = await fs.stat(path.join(directory, file));
    if (stats.isDirectory()) {
      result.push(...(await findSupplementFiles(path.join(directory, file))));
    } else if (file.endsWith('.openapi.json')) {
      result.push(path.join(directory, file));
    }
  }

  return result;
};
/* eslint-enable @silverhand/fp/no-mutating-methods, no-await-in-loop */

/**
 * Normalize the path to the OpenAPI path by adding `/api` prefix and replacing the path parameters
 * with OpenAPI path parameters.
 *
 * @example
 * normalizePath('/organization/:id') -> '/api/organization/{id}'
 */
export const normalizePath = (path: string) =>
  `/api${path}`
    .split('/')
    .map((part) => (part.startsWith(':') ? `{${part.slice(1)}}` : part))
    .join('/');
