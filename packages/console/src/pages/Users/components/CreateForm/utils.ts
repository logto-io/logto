import { customAlphabet } from 'nanoid';

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const passwordLength = 8;

// Note: password requires a minimum of 8 characters and contains a mix of letters, numbers, and symbols.
export const createPassword = () => {
  const randomLength = Math.floor(Math.random() * (passwordLength - 1)) + 1;
  const randomNumbers = Array.from({ length: randomLength }, () =>
    Math.floor(Math.random() * 10)
  ).join('');
  const randomCharacters = customAlphabet(alphabet, passwordLength - randomLength)();

  return `${randomNumbers}${randomCharacters}`
    .split('')
    .slice()
    .sort(() => Math.random() - 0.5)
    .join('');
};
