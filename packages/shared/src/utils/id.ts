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

export const buildIdGenerator: BuildIdGenerator = (size: number, includingUppercase = false) =>
  customAlphabet(includingUppercase ? alphabet : lowercaseAlphabet, size);
export const generateStandardId = buildIdGenerator(21);
