import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import { ReservedPlanName } from '@/types/subscriptions';

const registeredPlanNamePhraseMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  quotaKey: undefined,
  [ReservedPlanName.Free]: 'free_plan',
  [ReservedPlanName.Hobby]: 'hobby_plan',
  [ReservedPlanName.Pro]: 'pro_plan',
  [ReservedPlanName.Enterprise]: 'enterprise',
};

type Props = {
  name: string;
};

function PlanName({ name }: Props) {
  const planNamePhrase = registeredPlanNamePhraseMap[name];

  /**
   * Note: fallback to the plan name if the phrase is not registered.
   */
  if (!planNamePhrase) {
    return <span>{name}</span>;
  }

  return <DynamicT forKey={`subscription.${planNamePhrase}`} />;
}

export default PlanName;
