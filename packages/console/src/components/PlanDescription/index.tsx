import { type TFuncKey } from 'i18next';

import DynamicT from '@/ds-components/DynamicT';
import { ReservedPlanName } from '@/types/subscriptions';

import * as styles from './index.module.scss';

const registeredPlanDescriptionPhrasesMap: Record<
  string,
  TFuncKey<'translation', 'admin_console.subscription'> | undefined
> = {
  [ReservedPlanName.Free]: 'free_plan_description',
  [ReservedPlanName.Hobby]: 'hobby_plan_description',
  [ReservedPlanName.Pro]: 'pro_plan_description',
};

type Props = { planName: string };

function PlanDescription({ planName }: Props) {
  const description = registeredPlanDescriptionPhrasesMap[planName];

  if (!description) {
    return null;
  }

  return (
    <div className={styles.description}>
      <DynamicT forKey={`subscription.${description}`} />
    </div>
  );
}

export default PlanDescription;
