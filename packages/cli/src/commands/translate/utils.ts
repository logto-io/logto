import fs from 'node:fs/promises';
import path from 'node:path';

import { type LanguageTag } from '@logto/language-kit';

import { log } from '../../utils.js';

export const baseLanguage = 'en' satisfies LanguageTag;

export const readLocaleFiles = async (directory: string): Promise<string[]> => {
  const entities = await fs.readdir(directory, { withFileTypes: true });

  const result = await Promise.all(
    entities.map(async (entity) => {
      if (entity.isDirectory()) {
        return readLocaleFiles(path.join(directory, entity.name));
      }

      return entity.name.endsWith('.ts') ? path.join(directory, entity.name) : [];
    })
  );

  return result.flat();
};

export const readBaseLocaleFiles = async (directory: string): Promise<string[]> => {
  const enDirectory = path.join(directory, baseLanguage);
  const stat = await fs.stat(enDirectory);

  if (!stat.isDirectory()) {
    log.error(directory, 'has no `' + baseLanguage + '` directory');
  }

  return readLocaleFiles(enDirectory);
};
