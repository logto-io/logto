import { existsSync, readFileSync } from 'fs';
import path from 'path';

export const getFileContents = (relativePath: string, fallbackContent: string): string => {
  // eslint-disable-next-line unicorn/prefer-module
  if (existsSync(path.join(__dirname, relativePath))) {
    return readFileSync(relativePath, 'utf8');
  }

  return fallbackContent;
};
