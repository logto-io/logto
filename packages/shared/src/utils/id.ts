import { customAlphabet } from 'nanoid';

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
