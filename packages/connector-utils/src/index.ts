import { existsSync, readFileSync } from 'fs';

export const getMarkdownContents = (filePath: string, fallbackContent: string): string => {
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf8');
  }

  return fallbackContent;
};
