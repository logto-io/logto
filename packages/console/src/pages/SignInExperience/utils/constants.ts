import {
  type LocalePhraseGroupKey,
  type LocalePhraseKey,
} from '@logto/phrases-experience/lib/types';
import { conditionalArray } from '@silverhand/essentials';

import { isDevFeaturesEnabled } from '@/consts/env';

export const hiddenLocalePhraseGroups: readonly LocalePhraseGroupKey[] = [
  'demo_app',
  ...conditionalArray(!isDevFeaturesEnabled && 'mfa'),
];

export const hiddenLocalePhrases: readonly LocalePhraseKey[] = [
  ...conditionalArray(
    !isDevFeaturesEnabled &&
      ([
        'action.copy',
        'action.verify_via_passkey',
        'action.download',
        'input.backup_code',
      ] satisfies LocalePhraseKey[])
  ),
];
