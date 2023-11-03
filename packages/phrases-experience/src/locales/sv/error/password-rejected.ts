import { type PasswordRejectionCode } from '@logto/core-kit';

type BreakdownKeysToObject<Key extends string> = {
  [K in Key as K extends `${infer A}.${string}` ? A : K]: K extends `${string}.${infer B}`
    ? BreakdownKeysToObject<B>
    : string;
};

type RejectionPhrases = BreakdownKeysToObject<PasswordRejectionCode>;

const password_rejected = {
  too_short: 'Minst {{min}} tecken.',
  too_long: 'Max {{max}} tecken.',
  character_types: 'Minst {{min}} olika tecken krävs..',
  unsupported_characters: 'Tecken som inte stöds hittades.',
  pwned: 'Undvik enkla lösenord som är lätt att gissa.',
  restricted_found: 'Undvik överanvändning av {{list, list}}.',
  restricted: {
    repetition: 'upprepade tecken',
    sequence: 'tecken i sekvens',
    user_info: 'personlig information',
    words: 'ord relaterade till produkten',
  },
} satisfies RejectionPhrases & {
  // Use for displaying a list of restricted issues
  restricted_found: string;
};

export default Object.freeze(password_rejected);
