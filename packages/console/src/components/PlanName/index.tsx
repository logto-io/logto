import { type TFuncKey } from 'i18next';
import { useTranslation } from 'react-i18next';

import { ReservedPlanName } from '@/types/subscriptions';

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

type Props = {
  readonly name: string;
};

function PlanName({ name }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const planNamePhrase = registeredPlanNamePhraseMap[name];

  /**
   * Note: fallback to the plan name if the phrase is not registered.
   */
  const planName = planNamePhrase ? String(t(planNamePhrase)) : name;

  return <span>{planName}</span>;
}

export default PlanName;
