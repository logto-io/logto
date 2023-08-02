import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import { ReservedPlanName } from '@/types/subscriptions';

const planNamePhraseMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  [ReservedPlanName.Free]: 'free_plan',
  [ReservedPlanName.Hobby]: 'hobby_plan',
  [ReservedPlanName.Pro]: 'pro_plan',
  [ReservedPlanName.Enterprise]: 'enterprise',
};

const planNameTitlePhraseMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  [ReservedPlanName.Free]: 'free_plan_title',
  [ReservedPlanName.Hobby]: 'hobby_plan_title',
  [ReservedPlanName.Pro]: 'pro_plan_title',
  [ReservedPlanName.Enterprise]: 'enterprise_title',
};

type Props = {
  name: string;
  isTitleCase?: boolean;
};

function PlanName({ name, isTitleCase = false }: Props) {
  const planNamePhrase = isTitleCase ? planNameTitlePhraseMap[name] : planNamePhraseMap[name];

  /**
   * Note: fallback to the plan name if the phrase is not registered.
   */
  if (!planNamePhrase) {
    return <span>{name}</span>;
  }

  return (
    <span>
      <DynamicT forKey={`subscription.${planNamePhrase}`} />
    </span>
  );
}

export default PlanName;
