import { ReservedPlanId } from '@logto/schemas';
import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';

const registeredPlanDescriptionPhrasesMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  [ReservedPlanId.Free]: 'free_plan_description',
  [ReservedPlanId.Pro]: 'pro_plan_description',
  [ReservedPlanId.Pro202411]: 'pro_plan_description',
  [ReservedPlanId.Pro202509]: 'pro_plan_description',
};

const getRegisteredPlanDescriptionPhrase = (
  skuId: string,
  isEnterprisePlan = false
): TFuncKey<'translation', 'admin_console.subscription'> | undefined => {
  if (isEnterprisePlan) {
    return 'enterprise_description';
  }

  return registeredPlanDescriptionPhrasesMap[skuId];
};

type Props = {
  readonly skuId: string;
  readonly isEnterprisePlan?: boolean;
};

function PlanDescription({ skuId, isEnterprisePlan = false }: Props) {
  const description = getRegisteredPlanDescriptionPhrase(skuId, isEnterprisePlan);

  if (!description) {
    return null;
  }

  return <DynamicT forKey={`subscription.${description}`} />;
}

export default PlanDescription;
