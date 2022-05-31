import { existsSync, readFileSync } from 'fs';

export const getFileContents = (filePath: string, fallbackContent: string): string => {
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf8');
  }

  return fallbackContent;
};
