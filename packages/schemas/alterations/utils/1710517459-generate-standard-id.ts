import { customAlphabet } from 'nanoid';

const lowercaseAlphabet = '0123456789abcdefghijklmnopqrstuvwxyz' as const;

// Edited from `@logto/shared`.
/**
 * Generate a standard id with 21 characters, including lowercase letters and numbers.
 *
 * @see {@link lowercaseAlphabet}
 */
export const generateStandardId = customAlphabet(lowercaseAlphabet, 21);
