import { type TFuncKey } from 'i18next';

import { ReservedPlanId } from '@/consts/subscriptions';
import DynamicT from '@/ds-components/DynamicT';

const registeredPlanDescriptionPhrasesMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  [ReservedPlanId.free]: 'free_plan_description',
  [ReservedPlanId.hobby]: 'hobby_plan_description',
  [ReservedPlanId.pro]: 'pro_plan_description',
};

type Props = { planId: string };

function PlanDescription({ planId }: Props) {
  const description = registeredPlanDescriptionPhrasesMap[planId];

  if (!description) {
    return null;
  }

  return <DynamicT forKey={`subscription.${description}`} />;
}

export default PlanDescription;
