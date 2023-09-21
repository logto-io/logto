import { type PasswordRejectionCode } from '@logto/core-kit';

type BreakdownKeysToObject<Key extends string> = {
  [K in Key as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}`
    ? BreakdownKeysToObject<B>
    : string;
};

type RejectionPhrases = BreakdownKeysToObject<PasswordRejectionCode>;

const password_rejected = {
  too_short: 'Minimum length is {{min}}.',
  too_long: 'Maximum length is {{max}}.',
  character_types: 'At least {{min}} types of characters are required.',
  unsupported_characters: 'Unsupported character found.',
  pwned: 'Avoid using simple passwords that are easy to guess.',
  restricted_found: 'Avoid overusing {{list, list}}.',
  restricted: {
    repetition: 'repeated characters',
    sequence: 'sequential characters',
    user_info: 'your personal information',
    words: 'product context',
  },
} satisfies RejectionPhrases & {
  // Use for displaying a list of restricted issues
  restricted_found: string;
};

export default Object.freeze(password_rejected);
