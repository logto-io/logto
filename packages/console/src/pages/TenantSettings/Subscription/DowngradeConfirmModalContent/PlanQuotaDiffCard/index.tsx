import { Trans } from 'react-i18next';

import PlanName from '@/components/PlanName';
import PlanQuotaList from '@/components/PlanQuotaList';
import DynamicT from '@/ds-components/DynamicT';
import {
  type SubscriptionPlanQuotaEntries,
  type SubscriptionPlanQuota,
} from '@/types/subscriptions';

import DiffQuotaItem from './DiffQuotaItem';
import * as styles from './index.module.scss';

type Props = {
  planName: string;
  quotaDiff: Partial<SubscriptionPlanQuota>;
  isDowngradeTargetPlan?: boolean;
};

function PlanQuotaDiffCard({ planName, quotaDiff, isDowngradeTargetPlan = false }: Props) {
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
        entries={
          // eslint-disable-next-line no-restricted-syntax
          Object.entries(quotaDiff) as SubscriptionPlanQuotaEntries
        }
        itemRenderer={(quotaKey, quotaValue) => (
          <DiffQuotaItem
            key={quotaKey}
            quotaKey={quotaKey}
            quotaValue={quotaValue}
            isForDowngradeTargetPlan={isDowngradeTargetPlan}
          />
        )}
      />
    </div>
  );
}

export default PlanQuotaDiffCard;
