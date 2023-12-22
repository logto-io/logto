import { cond } from '@silverhand/essentials';
import classNames from 'classnames';

import DescendArrow from '@/assets/icons/descend-arrow.svg';
import Failed from '@/assets/icons/failed.svg';
import QuotaListItem from '@/components/PlanQuotaList/QuotaListItem';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import * as styles from './index.module.scss';

type Props = {
  quotaKey: keyof SubscriptionPlanQuota;
  quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota];
  isForDowngradeTargetPlan?: boolean;
};

function DiffQuotaItem({ quotaKey, quotaValue, isForDowngradeTargetPlan }: Props) {
  const isNotCapable = quotaValue === 0 || quotaValue === false;
  const DowngradeStatusIcon = isNotCapable ? Failed : DescendArrow;

  return (
    <QuotaListItem
      quotaKey={quotaKey}
      quotaValue={quotaValue}
      icon={cond(
        isForDowngradeTargetPlan && (
          <DowngradeStatusIcon
            className={classNames(styles.icon, isNotCapable && styles.notCapable)}
          />
        )
      )}
      phraseClassName={cond(isNotCapable && styles.lineThrough)}
    />
  );
}

export default DiffQuotaItem;
