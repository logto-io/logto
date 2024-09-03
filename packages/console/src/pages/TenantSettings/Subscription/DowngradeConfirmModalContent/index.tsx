import { diff } from 'deep-object-diff';
import { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { type LogtoSkuResponse } from '@/cloud/types/router';
import PlanName from '@/components/PlanName';
import { comingSoonQuotaKeys, comingSoonSkuQuotaKeys } from '@/consts/plan-quotas';
import { type LogtoSkuQuota, type LogtoSkuQuotaEntries } from '@/types/skus';
import {
  type SubscriptionPlanQuota,
  type SubscriptionPlan,
  type SubscriptionPlanQuotaEntries,
} from '@/types/subscriptions';

import PlanQuotaDiffCard from './PlanQuotaDiffCard';
import styles from './index.module.scss';

type Props = {
  readonly currentPlan: SubscriptionPlan;
  readonly targetPlan: SubscriptionPlan;
  readonly currentSku: LogtoSkuResponse;
  readonly targetSku: LogtoSkuResponse;
};

const excludeComingSoonFeatures = (
  quotaDiff: Partial<SubscriptionPlanQuota>
): Partial<SubscriptionPlanQuota> => {
  // eslint-disable-next-line no-restricted-syntax
  const entries = Object.entries(quotaDiff) as SubscriptionPlanQuotaEntries;
  return Object.fromEntries(entries.filter(([key]) => !comingSoonQuotaKeys.includes(key)));
};

const excludeSkuComingSoonFeatures = (
  quotaDiff: Partial<LogtoSkuQuota>
): Partial<LogtoSkuQuota> => {
  // eslint-disable-next-line no-restricted-syntax
  const entries = Object.entries(quotaDiff) as LogtoSkuQuotaEntries;
  return Object.fromEntries(entries.filter(([key]) => !comingSoonSkuQuotaKeys.includes(key)));
};

function DowngradeConfirmModalContent({ currentPlan, targetPlan, currentSku, targetSku }: Props) {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const { quota: currentQuota, name: currentPlanName } = currentPlan;

  const { quota: targetQuota, name: targetPlanName } = targetPlan;

  const currentQuotaDiff = useMemo(
    () => excludeComingSoonFeatures(diff(targetQuota, currentQuota)),
    [currentQuota, targetQuota]
  );

  const currentSkuQuotaDiff = useMemo(
    () => excludeSkuComingSoonFeatures(diff(targetSku.quota, currentSku.quota)),
    [targetSku.quota, currentSku.quota]
  );

  const targetQuotaDiff = useMemo(
    () => excludeComingSoonFeatures(diff(currentQuota, targetQuota)),
    [currentQuota, targetQuota]
  );

  const targetSkuQuotaDiff = useMemo(
    () => excludeSkuComingSoonFeatures(diff(currentSku.quota, targetSku.quota)),
    [targetSku.quota, currentSku.quota]
  );

  return (
    <div className={styles.container}>
      <div className={styles.description}>
        <Trans
          components={{
            targetName: <PlanName skuId={targetSku.id} name={targetPlanName} />,
            currentName: <PlanName skuId={currentSku.id} name={currentPlanName} />,
          }}
        >
          {t('subscription.downgrade_modal.description')}
        </Trans>
      </div>
      <div className={styles.content}>
        <PlanQuotaDiffCard
          planName={currentPlanName}
          quotaDiff={currentQuotaDiff}
          skuQuotaDiff={currentSkuQuotaDiff}
        />
        <PlanQuotaDiffCard
          isDowngradeTargetPlan
          planName={targetPlanName}
          quotaDiff={targetQuotaDiff}
          skuQuotaDiff={targetSkuQuotaDiff}
        />
      </div>
    </div>
  );
}

export default DowngradeConfirmModalContent;
