import { customAlphabet, nanoid } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const digits = '0123456789';

// Note: password requires a minimum of 8 characters and contains a mix of letters, numbers, and symbols.
export const createInitialPassword = () => {
  const randomAlphabet = customAlphabet(alphabet, 1)();
  const randomDigit = customAlphabet(digits, 1)();

  return `${randomAlphabet}${randomDigit}${nanoid(6)}`;
};
