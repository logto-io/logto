import { customAlphabet } from 'nanoid';
import { v5 as uuidv5, v7 as uuidv7 } from 'uuid';

const lowercaseAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
const alphabet = `${lowercaseAlphabet}ABCDEFGHIJKLMNOPQRSTUVWXYZ` as const;

type BuildIdGenerator = {
  /**
   * Build a nanoid generator function uses numbers (0-9), lowercase letters (a-z), and uppercase letters (A-Z) as the alphabet.
   * @param size The default id length for the generator.
   */
  (size: number): ReturnType<typeof customAlphabet>;
  /**
   * Build a nanoid generator function uses numbers (0-9) and lowercase letters (a-z) as the alphabet.
   * @param size The default id length for the generator.
   */
  // eslint-disable-next-line @typescript-eslint/unified-signatures
  (size: number, includingUppercase: false): ReturnType<typeof customAlphabet>;
};

const buildIdGenerator: BuildIdGenerator = (size: number, includingUppercase = true) =>
  customAlphabet(includingUppercase ? alphabet : lowercaseAlphabet, size);

/**
 * ID format types supported by Logto.
 * - Nanoid: Compact, URL-safe IDs (12-21 characters)
 * - Uuid: UUID v7 (time-ordered, 36 characters)
 */
export enum IdFormat {
  Nanoid = 'nanoid',
  Uuid = 'uuid',
}

/**
 * Generate a format-aware standard ID.
 * For 'nanoid' format, generates a lowercase alphanumeric string of the given size (default 21).
 * For 'uuid' format, generates a UUID v7 string.
 *
 * @param size - Only affects nanoid format. Has no effect in uuid mode since UUIDs have a fixed
 * 36-character length.
 */
export const generateStandardId = (size?: number): string => generateId(undefined, size);

/**
 * Generate a standard short id with 12 characters, including lowercase letters and numbers.
 * This is NOT format-aware — it always generates a nanoid regardless of ID_FORMAT.
 * Used for non-entity IDs like connector IDs, UI keys, etc.
 *
 * @see {@link lowercaseAlphabet}
 */
export const generateStandardShortId = buildIdGenerator(12, false);

/**
 * Generate a standard secret with 32 characters, including uppercase letters, lowercase
 * letters, and numbers.
 *
 * @see {@link alphabet}
 */
export const generateStandardSecret = buildIdGenerator(32);

/**
 * Generate a UUID v7 string (time-ordered).
 * UUID v7 includes a timestamp in the first 48 bits, making it sortable by creation time.
 * This provides better database index performance compared to UUID v4.
 *
 * @returns A UUID v7 string (36 characters with hyphens, e.g., "018e8c3a-9d2e-7890-a123-456789abcdef")
 */
export const generateUuidV7 = (): string => uuidv7();

/**
 * Fixed namespace UUID for deterministic seed ID generation via UUID v5.
 * This must never change — all existing UUID-format databases depend on it.
 */
const logtoSeedNamespace = 'f4f4f4f4-f4f4-4f4f-8f4f-f4f4f4f4f4f4';

/**
 * Convert a hardcoded seed ID name to the appropriate format.
 * For 'nanoid' format, returns the name as-is (human-readable string).
 * For 'uuid' format, returns a deterministic UUID v5 derived from the name,
 * which is a valid UUID and can be stored in native PostgreSQL `uuid` columns.
 *
 * @param name - The human-readable seed ID (e.g., 'admin-console', 'admin-role')
 * @returns The format-appropriate ID string
 */
export const buildSeedId = (name: string): string => {
  if (getIdFormat() === IdFormat.Nanoid) {
    return name;
  }
  return uuidv5(name, logtoSeedNamespace);
};

/**
 * Read the current ID format from the `ID_FORMAT` environment variable.
 * Defaults to 'nanoid' if not set.
 */
const idFormatValues: ReadonlySet<string> = new Set(Object.values(IdFormat));

export const isIdFormat = (value: string): value is IdFormat => idFormatValues.has(value);

export const getIdFormat = (): IdFormat => {
  const format = process.env.ID_FORMAT ?? IdFormat.Nanoid;
  if (!isIdFormat(format)) {
    throw new Error(
      `Invalid ID_FORMAT environment variable: '${format}'. Must be 'nanoid' or 'uuid'.`
    );
  }
  return format;
};

/**
 * Generate a format-aware ID.
 * When no format is specified, reads from the ID_FORMAT env variable (defaults to 'nanoid').
 * Use this for entity columns that support uuid type (users, roles, organizations, etc.).
 *
 * @param format - The ID format to use. Defaults to getIdFormat() if omitted.
 * @param size - Only affects nanoid format (defaults to 21). Has no effect in uuid mode since
 * UUIDs have a fixed 36-character length.
 * @returns A generated ID string
 */
export const generateId = (format?: IdFormat, size?: number): string => {
  const resolvedFormat = format ?? getIdFormat();
  if (resolvedFormat === IdFormat.Uuid) {
    return generateUuidV7();
  }

  // Default to standard size (21) if not specified
  const idSize = size ?? 21;
  return buildIdGenerator(idSize, false)();
};
