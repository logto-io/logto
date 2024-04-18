import { customAlphabet } from 'nanoid';

const backupCodeCount = 10;
const alphabet = '0123456789abcdef';

/**
 * Generates a group of random backup codes.
 * The code is a 10-digit string of letters from 1 to f.
 */
export const generateBackupCodes = () => {
  const codes = Array.from({ length: backupCodeCount }, () => customAlphabet(alphabet, 10)());
  return codes;
};
