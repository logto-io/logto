import { customAlphabet } from 'nanoid';

const backupCodeCount = 10;
const alphabet = '0123456789abcdef';

/**
 * Generates a group of random backup codes.
 * The code is a 10-digit string of letters from 1 to f.
 */
export const generateBackupCodes = () => {
  return Array.from({ length: backupCodeCount }, () => customAlphabet(alphabet, 10)());
};

/**
 * Validates a group of backup codes.
 * @param codes
 */
export const validateBackupCodes = (codes: string[]) => {
  return codes.length === backupCodeCount && codes.every((code) => /^[\da-f]{10}$/i.test(code));
};
