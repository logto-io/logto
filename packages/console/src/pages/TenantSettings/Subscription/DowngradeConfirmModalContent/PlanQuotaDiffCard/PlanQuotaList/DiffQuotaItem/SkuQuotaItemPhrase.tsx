import { cond } from '@silverhand/essentials';

import {
  skuQuotaItemUnlimitedPhrasesMap,
  skuQuotaItemPhrasesMap,
  skuQuotaItemLimitedPhrasesMap,
} from '@/consts/quota-item-phrases';
import DynamicT from '@/ds-components/DynamicT';
import { type LogtoSkuQuota } from '@/types/skus';

const quotaItemPhraseKeyPrefix = 'subscription.quota_item';

type Props = {
  readonly skuQuotaKey: keyof LogtoSkuQuota;
  readonly skuQuotaValue: LogtoSkuQuota[keyof LogtoSkuQuota];
};

function SkuQuotaItemPhrase({ skuQuotaKey, skuQuotaValue }: Props) {
  const isUnlimited = skuQuotaValue === null;
  const isNotCapable = skuQuotaValue === 0 || skuQuotaValue === false;
  const isLimited = Boolean(skuQuotaValue);

  const phraseKey =
    cond(isUnlimited && skuQuotaItemUnlimitedPhrasesMap[skuQuotaKey]) ??
    cond(isNotCapable && skuQuotaItemPhrasesMap[skuQuotaKey]) ??
    cond(isLimited && skuQuotaItemLimitedPhrasesMap[skuQuotaKey]);

  if (!phraseKey) {
    // Should not happen
    return null;
  }

  return (
    <DynamicT
      forKey={`${quotaItemPhraseKeyPrefix}.${phraseKey}`}
      interpolation={cond(
        isLimited && typeof skuQuotaValue === 'number' && { count: skuQuotaValue }
      )}
    />
  );
}

export default SkuQuotaItemPhrase;
