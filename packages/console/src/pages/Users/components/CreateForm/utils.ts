import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';

// Note: password requires a minimum of 8 characters and contains a mix of letters, numbers, and symbols.
export const createInitialPassword = () => {
  const randomAlphabet = customAlphabet(alphabet);
  const randomDigit = customAlphabet(digits);
  const randomAlphabetOrDigit = customAlphabet(alphabet + digits);

  return `${randomAlphabet(1)}${randomDigit(1)}${randomAlphabetOrDigit(6)}`;
};
