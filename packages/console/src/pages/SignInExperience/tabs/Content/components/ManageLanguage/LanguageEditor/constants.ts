import {
  type LocalePhraseGroupKey,
  type LocalePhraseKey,
} from '@logto/phrases-experience/lib/types';
import { conditional, conditionalArray } from '@silverhand/essentials';

import { isDevFeaturesEnabled } from '@/consts/env';

export const excludePhraseGroups: readonly LocalePhraseGroupKey[] = [
  'demo_app',
  ...conditionalArray(!isDevFeaturesEnabled && 'mfa'),
] as const;

type ExcludePhrase = {
  [GroupKey in LocalePhraseGroupKey]: {
    groupKey: GroupKey;
    phraseKeys: Array<LocalePhraseKey<GroupKey>>;
  };
}[LocalePhraseGroupKey];

export const excludePhrases: readonly ExcludePhrase[] =
  conditional(
    !isDevFeaturesEnabled && [
      {
        groupKey: 'action',
        phraseKeys: ['copy', 'verify_via_passkey', 'download'],
      },
      {
        groupKey: 'input',
        phraseKeys: ['backup_code'],
      },
    ]
  ) ?? [];
