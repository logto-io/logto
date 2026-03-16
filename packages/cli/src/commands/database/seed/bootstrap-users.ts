import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getEnv } from '@silverhand/essentials';

import { consoleLog } from '../../../utils.js';

export type SeedUser = {
  username: string;
  email?: string;
  password: string;
  name?: string;
  familyName?: string;
  givenName?: string;
};

const parseCsvRow = (headers: string[], line: string): SeedUser | undefined => {
  const values = line.split(',').map((value) => value.trim());

  const getValue = (key: string): string | undefined => {
    const index = headers.indexOf(key);
    const value = index >= 0 ? values[index] : undefined;
    return value && value.length > 0 ? value : undefined;
  };

  const username = getValue('username');
  const password = getValue('password');

  if (!username || !password) {
    consoleLog.warn(`Skipping user row with missing username or password: ${line}`);
    return undefined;
  }

  return {
    username,
    password,
    email: getValue('email'),
    name: getValue('name'),
    familyName: getValue('familyName'),
    givenName: getValue('givenName'),
  };
};

const parseCsvUsers = (content: string): SeedUser[] => {
  const [headerLine, ...dataLines] = content.trim().split('\n');

  if (!headerLine) {
    return [];
  }

  const headers = headerLine.split(',').map((header) => header.trim());

  return dataLines
    .filter((line) => line.trim().length > 0)
    .map((line) => parseCsvRow(headers, line))
    .filter((user): user is SeedUser => user !== undefined);
};

const parseJsonUsers = (content: string): SeedUser[] => {
  const parsed: unknown = JSON.parse(content);

  if (!Array.isArray(parsed)) {
    throw new TypeError('LOGTO_SEED_USERS_FILE JSON must contain an array of user objects');
  }

  return parsed.map((entry: Record<string, unknown>, index: number) => {
    if (!entry.username || !entry.password) {
      throw new Error(
        `User at index ${index} is missing required fields "username" and/or "password"`
      );
    }

    return {
      username: String(entry.username),
      password: String(entry.password),
      email: entry.email ? String(entry.email) : undefined,
      name: entry.name ? String(entry.name) : undefined,
      familyName: entry.familyName ? String(entry.familyName) : undefined,
      givenName: entry.givenName ? String(entry.givenName) : undefined,
    };
  });
};

export const loadSeedUsers = async (): Promise<SeedUser[]> => {
  const filePath = getEnv('LOGTO_SEED_USERS_FILE');

  if (!filePath) {
    return [];
  }

  const content = await readFile(filePath, 'utf8');
  const extension = path.extname(filePath).toLowerCase();

  if (extension === '.json') {
    return parseJsonUsers(content);
  }

  if (extension === '.csv') {
    return parseCsvUsers(content);
  }

  throw new Error(`Unsupported seed users file format: ${extension}. Use .json or .csv`);
};
