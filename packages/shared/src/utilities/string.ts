import { customAlphabet } from 'nanoid';

export const generateRandomString = (
  size: number,
  alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
): string => customAlphabet(alphabet, size)();
