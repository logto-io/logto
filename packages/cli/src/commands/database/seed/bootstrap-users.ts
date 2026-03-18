import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { getEnv } from '@silverhand/essentials';

import { consoleLog } from '../../../utils.js';

/** Represents a single user entry to be seeded into the default tenant. */
export type SeedUser = {
  /** Primary email address used as the user's login identifier. */
  email: string;
  /** Optional username. When omitted, only email-based sign-in is available for this user. */
  username?: string;
  /** Plaintext password that will be hashed with Argon2i before storage. */
  password: string;
  /** Optional full display name. */
  name?: string;
  /** Optional family (last) name stored in the user profile. */
  familyName?: string;
  /** Optional given (first) name stored in the user profile. */
  givenName?: string;
};

/**
 * Extracts optional name profile fields from a seed user into the flat object expected by the
 * `profile` column.
 *
 * @param user - Source seed user entry.
 * @returns A partial profile record containing only the fields that are present on the user.
 */
export const buildUserProfile = (user: SeedUser): Record<string, string> => ({
  ...(user.familyName ? { familyName: user.familyName } : {}),
  ...(user.givenName ? { givenName: user.givenName } : {}),
});

/**
 * Parses a single CSV data row into a {@link SeedUser}.
 *
 * @param headers - Column names derived from the CSV header row.
 * @param line - Raw CSV line to parse.
 * @returns A {@link SeedUser} if both `email` and `password` columns are present, otherwise
 * `undefined` (the row is skipped with a warning).
 */
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

/**
 * Parses a CSV file's text content into an array of {@link SeedUser} objects.
 *
 * The first line must be a header row containing at least `email` and `password` columns.
 * Rows with missing required fields are silently skipped.
 *
 * @param content - Full text content of the CSV file.
 * @returns Array of valid {@link SeedUser} entries.
 */
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

/**
 * Parses a JSON file's text content into an array of {@link SeedUser} objects.
 *
 * The JSON must be a top-level array; each element must have at minimum `email` and `password`
 * string fields. Throws if the structure is invalid.
 *
 * @param content - Full text content of the JSON file.
 * @returns Array of {@link SeedUser} entries.
 * @throws {TypeError} When the JSON root is not an array.
 * @throws {Error} When any element is missing `email` or `password`.
 */
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

/**
 * Loads seed users from the file path specified by the `LOGTO_SEED_USERS_FILE` environment
 * variable.
 *
 * Supports `.json` and `.csv` file formats. Returns an empty array when the environment variable
 * is not set.
 *
 * @returns Array of {@link SeedUser} entries parsed from the file, or `[]` if the variable is unset.
 * @throws {Error} When the file extension is not `.json` or `.csv`.
 */
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
