import { customAlphabet } from 'nanoid';

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const buildIdGenerator = (size: number) => customAlphabet(alphabet, size);
export const generateStandardId = buildIdGenerator(21);
