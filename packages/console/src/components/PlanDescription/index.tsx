import { ReservedPlanId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';

const registeredPlanDescriptionPhrasesMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  [ReservedPlanId.Free]: 'free_plan_description',
  [ReservedPlanId.Pro]: 'pro_plan_description',
  [ReservedPlanId.Enterprise]: 'enterprise_description',
};

type Props = {
  /** Temporarily mark as optional. */
  readonly skuId?: string;
  /** @deprecated */
  readonly planId: string;
};

function PlanDescription({ skuId, planId }: Props) {
  const description =
    conditional(skuId && registeredPlanDescriptionPhrasesMap[skuId]) ??
    registeredPlanDescriptionPhrasesMap[planId];

  if (!description) {
    return null;
  }

  return <DynamicT forKey={`subscription.${description}`} />;
}

export default PlanDescription;
