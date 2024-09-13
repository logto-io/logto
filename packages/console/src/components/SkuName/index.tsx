import { ReservedPlanId } from '@logto/schemas';
import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import { ReservedSkuId } from '@/types/subscriptions';

const registeredSkuIdNamePhraseMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  quotaKey: undefined,
  [ReservedSkuId.Free]: 'free_plan',
  [ReservedSkuId.Pro]: 'pro_plan',
  [ReservedSkuId.Development]: 'dev_plan',
  [ReservedSkuId.Admin]: 'admin_plan',
  [ReservedSkuId.Enterprise]: 'enterprise',
};

type Props = {
  readonly skuId: string;
  readonly isEnterprisePlan?: boolean;
};

function SkuName({ skuId: rawSkuId, isEnterprisePlan = false }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const skuId = isEnterprisePlan ? ReservedPlanId.Enterprise : rawSkuId;

  const skuNamePhrase = registeredSkuIdNamePhraseMap[skuId];

  /**
   * Note: fallback to the plan name if the phrase is not registered.
   */
  const skuName = skuNamePhrase ? String(t(skuNamePhrase)) : skuId;

  return <span>{skuName}</span>;
}

export default SkuName;
