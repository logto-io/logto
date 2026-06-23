import {
  type LocalePhraseGroupKey,
  type LocalePhraseKey,
} from '@logto/phrases-experience/lib/types';

/**
 * List of locale phrase groups that should be hidden from the experience UI language editor.
 *
 * Note:
 * - Not allowed customized phrases groups should be added here. Currently only the `development_tenant` group is not allowed.
 */
export const hiddenLocalePhraseGroups: readonly LocalePhraseGroupKey[] = ['development_tenant'];

/**
 * List of locale phrase key that should be hidden from the experience UI language editor.
 */
export const hiddenLocalePhrases: readonly LocalePhraseKey[] = [];
