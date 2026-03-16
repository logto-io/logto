import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getEnv } from '@silverhand/essentials';

import { consoleLog } from '../../../utils.js';

export type SeedUser = {
  email: string;
  username?: string;
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

  const email = getValue('email');
  const password = getValue('password');

  if (!email || !password) {
    consoleLog.warn(`Skipping user row with missing email or password: ${line}`);
    return undefined;
  }

  return {
    email,
    password,
    username: getValue('username'),
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
    if (!entry.email || !entry.password) {
      throw new Error(
        `User at index ${index} is missing required fields "email" and/or "password"`
      );
    }

    return {
      email: String(entry.email),
      password: String(entry.password),
      username: entry.username ? String(entry.username) : undefined,
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
