import { Trans, useTranslation } from 'react-i18next';

import PlanName from '@/components/PlanName';
import PlanQuotaList from '@/components/PlanQuotaList';
import { type SubscriptionPlanQuota } from '@/types/subscriptions';

import * as styles from './index.module.scss';

type Props = {
  planName: string;
  quotaDiff: Partial<SubscriptionPlanQuota>;
  isTarget?: boolean;
};

function PlanQuotaDiffCard({ planName, quotaDiff, isTarget = false }: Props) {
  const { t } = useTranslation(undefined, {
    keyPrefix: 'admin_console.subscription.downgrade_modal',
  });

  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <Trans
          components={{
            name: <PlanName name={planName} />,
          }}
        >
          {t(isTarget ? 'after' : 'before')}
        </Trans>
      </div>
      <PlanQuotaList isDiff quota={quotaDiff} hasIcon={isTarget} />
    </div>
  );
}

export default PlanQuotaDiffCard;
