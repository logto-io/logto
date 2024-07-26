import classNames from 'classnames';

import { isDevFeaturesEnabled } from '@/consts/env';
import { type LogtoSkuQuotaEntries } from '@/types/skus';
import { type SubscriptionPlanQuotaEntries } from '@/types/subscriptions';

import DiffQuotaItem, { DiffSkuQuotaItem } from './DiffQuotaItem';
import styles from './index.module.scss';

type Props = {
  readonly entries: SubscriptionPlanQuotaEntries;
  readonly skuQuotaEntries: LogtoSkuQuotaEntries;
  readonly isDowngradeTargetPlan: boolean;
  readonly className?: string;
};

function PlanQuotaList({ entries, skuQuotaEntries, isDowngradeTargetPlan, className }: Props) {
  return (
    <ul className={classNames(styles.planQuotaList, className)}>
      {isDevFeaturesEnabled
        ? skuQuotaEntries.map(([quotaKey, quotaValue]) => (
            <DiffSkuQuotaItem
              key={quotaKey}
              quotaKey={quotaKey}
              quotaValue={quotaValue}
              hasStatusIcon={isDowngradeTargetPlan}
            />
          ))
        : entries.map(([quotaKey, quotaValue]) => (
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
