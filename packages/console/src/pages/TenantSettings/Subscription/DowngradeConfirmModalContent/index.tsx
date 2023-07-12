import { diff } from 'deep-object-diff';
import { Trans, useTranslation } from 'react-i18next';

import PlanName from '@/components/PlanName';
import { type SubscriptionPlan } from '@/types/subscriptions';

import PlanQuotaDiffList from './PlanQuotaDiffList';
import * as styles from './index.module.scss';

type Props = {
  currentPlan: SubscriptionPlan;
  targetPlan: SubscriptionPlan;
};

function DowngradeConfirmModalContent({ currentPlan, targetPlan }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { quota: currentQuota, name: currentPlanName } = currentPlan;
  const { quota: targetQuota, name: targetPlanName } = targetPlan;

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Trans
          components={{
            targetName: <PlanName name={targetPlanName} />,
            currentName: <PlanName name={currentPlanName} />,
          }}
        >
          {t('subscription.downgrade_modal.description')}
        </Trans>
      </div>
      <div className={styles.content}>
        <PlanQuotaDiffList planName={currentPlanName} quotaDiff={diff(targetQuota, currentQuota)} />
        <PlanQuotaDiffList
          isTarget
          planName={targetPlanName}
          quotaDiff={diff(currentQuota, targetQuota)}
        />
      </div>
    </div>
  );
}

export default DowngradeConfirmModalContent;
