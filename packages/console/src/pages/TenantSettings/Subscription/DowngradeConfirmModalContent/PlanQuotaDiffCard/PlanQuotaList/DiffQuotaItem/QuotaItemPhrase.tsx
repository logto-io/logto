import { cond } from '@silverhand/essentials';

import {
  quotaItemUnlimitedPhrasesMap,
  quotaItemPhrasesMap,
  quotaItemLimitedPhrasesMap,
} from '@/consts/quota-item-phrases';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

const quotaItemPhraseKeyPrefix = 'subscription.quota_item';

type Props = {
  readonly quotaKey: keyof SubscriptionPlanQuota;
  readonly quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
};

function QuotaItemPhrase({ quotaKey, quotaValue }: Props) {
  const isUnlimited = quotaValue === null;
  const isNotCapable = quotaValue === 0 || quotaValue === false;
  const isLimited = Boolean(quotaValue);

  const phraseKey =
    cond(isUnlimited && quotaItemUnlimitedPhrasesMap[quotaKey]) ??
    cond(isNotCapable && quotaItemPhrasesMap[quotaKey]) ??
    cond(isLimited && quotaItemLimitedPhrasesMap[quotaKey]);

  if (!phraseKey) {
    // Should not happen
    return null;
  }

  return (
    <DynamicT
      forKey={`${quotaItemPhraseKeyPrefix}.${phraseKey}`}
      interpolation={cond(isLimited && typeof quotaValue === 'number' && { count: quotaValue })}
    />
  );
}

export default QuotaItemPhrase;
