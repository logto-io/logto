import classNames from 'classnames';
import { useMemo, type ReactNode } from 'react';

import { planQuotaItemOrder } from '@/consts/plan-quotas';
import {
  type SubscriptionPlanQuotaEntries,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';
import { sortBy } from '@/utils/sort';

import * as styles from './index.module.scss';

type Props = {
  entries: SubscriptionPlanQuotaEntries;
  itemRenderer: (
    quotaKey: keyof SubscriptionPlanQuota,
    quotaValue: SubscriptionPlanQuota[keyof SubscriptionPlanQuota]
  ) => ReactNode;
  className?: string;
};

function PlanQuotaList({ entries, itemRenderer, className }: Props) {
  const sortedEntries = useMemo(
    () =>
      entries
        .slice()
        .sort(([preQuotaKey], [nextQuotaKey]) =>
          sortBy(planQuotaItemOrder)(preQuotaKey, nextQuotaKey)
        ),
    [entries]
  );

  return (
    <ul className={classNames(styles.planQuotaList, className)}>
      {sortedEntries.map(([quotaKey, quotaValue]) => itemRenderer(quotaKey, quotaValue))}
    </ul>
  );
}

export default PlanQuotaList;
