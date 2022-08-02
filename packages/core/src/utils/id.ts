import { customAlphabet } from 'nanoid';

export const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export const buildIdGenerator = (size: number) => customAlphabet(alphabet, size);

export const buildApplicationSecret = buildIdGenerator(64);
