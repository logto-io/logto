import { defaultUsernamePolicy } from '@logto/core-kit';
import { type UsernamePolicy } from '@logto/schemas';
import { condArray } from '@silverhand/essentials';
import { type TFunction } from 'i18next';

const characterTypes = [
  ['uppercase', 'description.username_character.uppercase'],
  ['lowercase', 'description.username_character.lowercase'],
  ['numbers', 'description.username_character.number'],
  ['underscore', 'description.username_character.underscore'],
] as const;

/**
 * Build a localized username requirements sentence from the tenant policy, e.g.
 * "Username must be 4 to 8 characters and contain only lowercase letters, numbers, and underscores."
 * Surfaced as a field hint or page description depending on the consumer.
 *
 * Returns `undefined` when the policy matches the permissive default (length and character types
 * both unrestricted) — there is nothing worth surfacing. Mirrors the password policy's
 * `requirementsDescription`.
 */
export const buildUsernamePolicyDescription = (
  policy: UsernamePolicy | undefined,
  translate: TFunction
): string | undefined => {
  if (!policy) {
    return undefined;
  }

  const { minLength, maxLength, allowedChars } = policy;

  const isLengthRestrictive =
    minLength > defaultUsernamePolicy.minLength || maxLength < defaultUsernamePolicy.maxLength;
  const isCharsRestrictive = characterTypes.some(([key]) => !allowedChars[key]);

  if (!isLengthRestrictive && !isCharsRestrictive) {
    return undefined;
  }

  const allowedCharacterNames = characterTypes
    .filter(([key]) => allowedChars[key])
    .map(([, phraseKey]) => translate(phraseKey));

  const items = condArray(
    isLengthRestrictive &&
      translate('description.username_requirement.length', { min: minLength, max: maxLength }),
    isCharsRestrictive &&
      translate('description.username_requirement.characters', {
        characters: allowedCharacterNames,
      })
  );

  return translate('description.username_requirements', { items });
};
