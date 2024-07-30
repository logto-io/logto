import { conditional } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import { ReservedPlanName, ReservedSkuId } from '@/types/subscriptions';

const registeredPlanNamePhraseMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  quotaKey: undefined,
  [ReservedPlanName.Free]: 'free_plan',
  [ReservedPlanName.Hobby]: 'pro_plan',
  [ReservedPlanName.Pro]: 'pro_plan',
  [ReservedPlanName.Enterprise]: 'enterprise',
};

const registeredSkuIdNamePhraseMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  quotaKey: undefined,
  [ReservedSkuId.Free]: 'free_plan',
  [ReservedSkuId.Pro]: 'pro_plan',
  [ReservedSkuId.Enterprise]: 'enterprise',
};

type Props = {
  /** Temporarily use optional for backward compatibility. */
  readonly skuId?: string;
  /** @deprecated */
  readonly name: string;
};

// TODO: rename the component once new pricing model is ready, should be `SkuName`.
function PlanName({ skuId, name }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const planNamePhrase =
    conditional(skuId && registeredSkuIdNamePhraseMap[skuId]) ?? registeredPlanNamePhraseMap[name];

  /**
   * Note: fallback to the plan name if the phrase is not registered.
   */
  const planName = planNamePhrase ? String(t(planNamePhrase)) : name;

  return <span>{planName}</span>;
}

export default PlanName;
