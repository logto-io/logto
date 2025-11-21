import { customAlphabet } from 'nanoid';
import { v7 as uuidv7 } from 'uuid';

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
 * - 'nanoid': Compact, URL-safe IDs (12-21 characters)
 * - 'uuidv7': UUID v7 (time-ordered, 36 characters)
 */
export type IdFormat = 'nanoid' | 'uuidv7';

/**
 * Generate a standard id with 21 characters, including lowercase letters and numbers.
 *
 * @see {@link lowercaseAlphabet}
 */
export const generateStandardId = buildIdGenerator(21, false);

/**
 * Generate a standard short id with 12 characters, including lowercase letters and numbers.
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
 * Generate an ID based on the specified format.
 *
 * @param format - The ID format to use ('nanoid' or 'uuidv7')
 * @param size - The size for nanoid (ignored for uuidv7). Defaults to 21 for standard, 12 for short.
 * @returns A generated ID string
 */
export const generateId = (format: IdFormat, size?: number): string => {
  if (format === 'uuidv7') {
    return generateUuidV7();
  }

  // Default to standard size (21) if not specified
  const idSize = size ?? 21;
  return buildIdGenerator(idSize, false)();
};
