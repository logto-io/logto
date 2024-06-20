import { ReservedPlanId } from '@logto/schemas';
import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';

const registeredPlanDescriptionPhrasesMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  [ReservedPlanId.Free]: 'free_plan_description',
  [ReservedPlanId.Pro]: 'pro_plan_description',
};

type Props = { readonly planId: string };

function PlanDescription({ planId }: Props) {
  const description = registeredPlanDescriptionPhrasesMap[planId];

  if (!description) {
    return null;
  }

  return <DynamicT forKey={`subscription.${description}`} />;
}

export default PlanDescription;
