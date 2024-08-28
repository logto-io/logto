import classNames from 'classnames';

import { type SubscriptionPlanQuotaEntries } from '@/types/subscriptions';

import DiffQuotaItem from './DiffQuotaItem';
import * as styles from './index.module.scss';

type Props = {
  readonly entries: SubscriptionPlanQuotaEntries;
  readonly isDowngradeTargetPlan: boolean;
  readonly className?: string;
};

function PlanQuotaList({ entries, isDowngradeTargetPlan, className }: Props) {
  return (
    <ul className={classNames(styles.planQuotaList, className)}>
      {entries.map(([quotaKey, quotaValue]) => (
        <DiffQuotaItem
          key={quotaKey}
          quotaKey={quotaKey}
          quotaValue={quotaValue}
          hasStatusIcon={isDowngradeTargetPlan}
        />
      ))}
    </ul>
  );
}

export default PlanQuotaList;
