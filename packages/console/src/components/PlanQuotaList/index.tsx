import classNames from 'classnames';
import { useMemo } from 'react';

import { planQuotaItemOrder } from '@/consts/plan-quotas';
import {
  type SubscriptionPlanQuotaEntries,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';
import { sortBy } from '@/utils/sort';

import QuotaItem from './QuotaItem';
import * as styles from './index.module.scss';

type Props = {
  quota: Partial<SubscriptionPlanQuota>;
  featuredQuotaKeys?: Array<keyof SubscriptionPlanQuota>;
  comingSoonQuotaKeys?: Array<keyof SubscriptionPlanQuota>;
  className?: string;
  isDiff?: boolean;
  hasIcon?: boolean;
};

function PlanQuotaList({
  quota,
  featuredQuotaKeys,
  comingSoonQuotaKeys,
  isDiff,
  hasIcon,
  className,
}: Props) {
  const items = useMemo(() => {
    // eslint-disable-next-line no-restricted-syntax
    const entries = Object.entries(quota) as SubscriptionPlanQuotaEntries;

    const featuredEntries = featuredQuotaKeys
      ? entries.filter(([key]) => featuredQuotaKeys.includes(key))
      : entries;

    return featuredEntries
      .slice()
      .sort(([preQuotaKey], [nextQuotaKey]) =>
        sortBy(planQuotaItemOrder)(preQuotaKey, nextQuotaKey)
      );
  }, [quota, featuredQuotaKeys]);

  return (
    <ul className={classNames(styles.list, className)}>
      {items.map(([quotaKey, quotaValue]) => (
        <QuotaItem
          key={quotaKey}
          isDiffItem={isDiff}
          quotaKey={quotaKey}
          quotaValue={quotaValue}
          hasIcon={hasIcon}
          isComingSoonTagVisible={
            (quotaValue === null || Boolean(quotaValue)) && comingSoonQuotaKeys?.includes(quotaKey)
          }
        />
      ))}
    </ul>
  );
}

export default PlanQuotaList;
