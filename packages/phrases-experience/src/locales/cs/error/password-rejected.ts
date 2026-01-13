import { type PasswordRejectionCode } from '@logto/core-kit';

type BreakdownKeysToObject<Key extends string> = {
  [K in Key as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}`
    ? BreakdownKeysToObject<B>
    : string;
};

type RejectionPhrases = BreakdownKeysToObject<PasswordRejectionCode>;

const password_rejected = {
  too_short: 'Minimální délka je {{min}} znaků.',
  too_long: 'Maximální délka je {{max}} znaků.',
  character_types: 'Je vyžadováno alespoň {{min}} typů znaků.',
  unsupported_characters: 'Byl nalezen nepodporovaný znak.',
  pwned: 'Vyhni se jednoduchým heslům, která jsou snadno uhodnutelná.',
  restricted_found: 'Nepoužívej příliš často {{list, list}}.',
  restricted: {
    repetition: 'opakující se znaky',
    sequence: 'pořadové znaky',
    user_info: 'tvé osobní údaje',
    words: 'slova z kontextu produktu',
  },
} satisfies RejectionPhrases & {
  // Use for displaying a list of restricted issues
  restricted_found: string;
};

export default Object.freeze(password_rejected);
