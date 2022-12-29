import { execSync } from 'node:child_process';
import changesetConfig from '../.changeset/config.json' assert { type: 'json' };

export { default as changesetConfig } from '../.changeset/config.json' assert { type: 'json' };

export const corePackageName = '@logto/core';
/** @type {Array<{ name: string; version?: string; path: string; private: boolean; }>} */
export const allPackages = JSON
  .parse(execSync('pnpm recursive list --depth=-1 --json', { encoding: 'utf8' }))
  .filter(({ name }) => !name.endsWith('/root'));

export const mainPackages = [...changesetConfig.fixed].map(([first]) => first);

export const configuredPackages = new Set(changesetConfig.fixed.flat());
export const singlePackages = allPackages
  .filter(({ name }) => !configuredPackages.has(name))
  .map(({ name }) => name);
