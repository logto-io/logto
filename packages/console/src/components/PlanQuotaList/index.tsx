import classNames from 'classnames';
import { useMemo } from 'react';

import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import QuotaItem from './QuotaItem';
import * as styles from './index.module.scss';

type Props = {
  quota: Partial<SubscriptionPlanQuota>;
  featuredQuotaKeys?: Array<keyof SubscriptionPlanQuota>;
  className?: string;
  isDiff?: boolean;
  hasIcon?: boolean;
};

function PlanQuotaList({ quota, featuredQuotaKeys, isDiff, hasIcon, className }: Props) {
  const items = useMemo(() => {
    // Todo: @xiaoyijun LOG-6540 order keys
    // eslint-disable-next-line no-restricted-syntax
    const entries = Object.entries(quota) as Array<
      [keyof SubscriptionPlanQuota, SubscriptionPlanQuota[keyof SubscriptionPlanQuota]]
    >;

    const featuredEntries = featuredQuotaKeys
      ? entries.filter(([key]) => featuredQuotaKeys.includes(key))
      : entries;

    return featuredEntries;
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
        />
      ))}
    </ul>
  );
}

export default PlanQuotaList;
