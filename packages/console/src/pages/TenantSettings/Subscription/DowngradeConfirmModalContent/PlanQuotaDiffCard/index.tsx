import { useMemo } from 'react';
import { Trans } from 'react-i18next';

import PlanName from '@/components/PlanName';
import { planQuotaItemOrder, skuQuotaItemOrder } from '@/consts/plan-quotas';
import DynamicT from '@/ds-components/DynamicT';
import { type LogtoSkuQuota, type LogtoSkuQuotaEntries } from '@/types/skus';
import {
  type SubscriptionPlanQuotaEntries,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';
import { sortBy } from '@/utils/sort';

import PlanQuotaList from './PlanQuotaList';
import styles from './index.module.scss';

type Props = {
  readonly planName: string;
  readonly quotaDiff: Partial<SubscriptionPlanQuota>;
  readonly skuQuotaDiff: Partial<LogtoSkuQuota>;
  readonly isDowngradeTargetPlan?: boolean;
};

function PlanQuotaDiffCard({
  planName,
  quotaDiff,
  skuQuotaDiff,
  isDowngradeTargetPlan = false,
}: Props) {
  // eslint-disable-next-line no-restricted-syntax
  const sortedEntries = useMemo(
    () =>
      Object.entries(quotaDiff)
        .slice()
        .sort(([preQuotaKey], [nextQuotaKey]) =>
          sortBy(planQuotaItemOrder)(preQuotaKey, nextQuotaKey)
        ),
    [quotaDiff]
  ) as SubscriptionPlanQuotaEntries;
  // eslint-disable-next-line no-restricted-syntax
  const sortedSkuQuotaEntries = useMemo(
    () =>
      Object.entries(skuQuotaDiff)
        .slice()
        .sort(([preQuotaKey], [nextQuotaKey]) =>
          sortBy(skuQuotaItemOrder)(preQuotaKey, nextQuotaKey)
        ),
    [skuQuotaDiff]
  ) as LogtoSkuQuotaEntries;

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Trans
          components={{
            name: <PlanName name={planName} />,
          }}
        >
          <DynamicT
            forKey={`subscription.downgrade_modal.${isDowngradeTargetPlan ? 'after' : 'before'}`}
          />
        </Trans>
      </div>
      <PlanQuotaList
        entries={sortedEntries}
        skuQuotaEntries={sortedSkuQuotaEntries}
        isDowngradeTargetPlan={isDowngradeTargetPlan}
      />
    </div>
  );
}

export default PlanQuotaDiffCard;
