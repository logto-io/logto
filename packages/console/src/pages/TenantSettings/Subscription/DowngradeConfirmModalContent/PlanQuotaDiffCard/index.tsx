import { useMemo } from 'react';
import { Trans } from 'react-i18next';

import PlanName from '@/components/PlanName';
import { planQuotaItemOrder } from '@/consts/plan-quotas';
import DynamicT from '@/ds-components/DynamicT';
import {
  type SubscriptionPlanQuotaEntries,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';
import { sortBy } from '@/utils/sort';

import PlanQuotaList from './PlanQuotaList';
import * as styles from './index.module.scss';

type Props = {
  readonly planName: string;
  readonly quotaDiff: Partial<SubscriptionPlanQuota>;
  readonly isDowngradeTargetPlan?: boolean;
};

function PlanQuotaDiffCard({ planName, quotaDiff, isDowngradeTargetPlan = false }: Props) {
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
      <PlanQuotaList entries={sortedEntries} isDowngradeTargetPlan={isDowngradeTargetPlan} />
    </div>
  );
}

export default PlanQuotaDiffCard;
