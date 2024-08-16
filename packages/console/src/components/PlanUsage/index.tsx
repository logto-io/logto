import { ReservedPlanId } from '@logto/schemas';
import { cond, conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useContext, useMemo } from 'react';

import { type Subscription, type NewSubscriptionPeriodicUsage } from '@/cloud/types/router';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { formatPeriod } from '@/utils/subscription';

import PlanUsageCard, { type Props as PlanUsageCardProps } from './PlanUsageCard';
import styles from './index.module.scss';
import { usageKeys, usageKeyPriceMap, usageKeyMap, titleKeyMap, tooltipKeyMap } from './utils';

type Props = {
  /** @deprecated */
  readonly currentSubscription: Subscription;
  /** @deprecated */
  readonly currentPlan: SubscriptionPlan;
  readonly periodicUsage?: NewSubscriptionPeriodicUsage;
};

function PlanUsage({ currentSubscription, currentPlan, periodicUsage: rawPeriodicUsage }: Props) {
  const {
    currentSubscriptionQuota,
    currentSubscriptionUsage,
    currentSubscription: currentSubscriptionFromNewPricingModel,
  } = useContext(SubscriptionDataContext);
  const { currentTenant } = useContext(TenantsContext);

  const { currentPeriodStart, currentPeriodEnd } = isDevFeaturesEnabled
    ? currentSubscriptionFromNewPricingModel
    : currentSubscription;

  const periodicUsage = useMemo(
    () =>
      rawPeriodicUsage ??
      conditional(
        currentTenant && {
          mauLimit: currentTenant.usage.activeUsers,
          tokenLimit: currentTenant.usage.tokenUsage,
        }
      ),
    [currentTenant, rawPeriodicUsage]
  );

  if (!periodicUsage) {
    return null;
  }

  const [activeUsers, mauLimit] = [
    periodicUsage.mauLimit,
    isDevFeaturesEnabled ? currentSubscriptionQuota.mauLimit : currentPlan.quota.mauLimit,
  ];

  const mauUsagePercent = conditional(mauLimit && activeUsers / mauLimit);

  const usages: PlanUsageCardProps[] = usageKeys
    // Show all usages for Pro plan and only show MAU and token usage for Free plan
    .filter(
      (key) =>
        currentSubscriptionFromNewPricingModel.planId === ReservedPlanId.Pro ||
        (currentSubscriptionFromNewPricingModel.planId === ReservedPlanId.Free &&
          (key === 'mauLimit' || key === 'tokenLimit'))
    )
    .map((key) => ({
      usage:
        key === 'mauLimit' || key === 'tokenLimit'
          ? periodicUsage[key]
          : currentSubscriptionUsage[key],
      usageKey: `subscription.usage.${usageKeyMap[key]}`,
      titleKey: `subscription.usage.${titleKeyMap[key]}`,
      unitPrice: usageKeyPriceMap[key],
      ...conditional(
        currentSubscriptionFromNewPricingModel.planId === ReservedPlanId.Pro && {
          tooltipKey: `subscription.usage.${tooltipKeyMap[key]}`,
        }
      ),
      ...cond(
        (key === 'tokenLimit' || key === 'mauLimit') && { quota: currentSubscriptionQuota[key] }
      ),
    }));

  return isDevFeaturesEnabled ? (
    <div>
      <div className={classNames(styles.planCycle, styles.planCycleNewPricingModel)}>
        <DynamicT
          forKey="subscription.plan_cycle"
          interpolation={{
            period: formatPeriod({
              periodStart: currentPeriodStart,
              periodEnd: currentPeriodEnd,
            }),
            renewDate: dayjs(currentPeriodEnd).add(1, 'day').format('MMM D, YYYY'),
          }}
        />
      </div>
      <div className={styles.newPricingModelUsage}>
        {usages.map((props, index) => (
          <PlanUsageCard
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={classNames(
              styles.cardItem,
              currentSubscriptionFromNewPricingModel.planId === ReservedPlanId.Free &&
                styles.freeUser
            )}
            {...props}
          />
        ))}
      </div>
    </div>
  ) : (
    <div className={styles.container}>
      <div className={styles.usage}>
        {`${activeUsers} / `}
        {mauLimit === null ? (
          <DynamicT forKey="subscription.quota_table.unlimited" />
        ) : (
          mauLimit.toLocaleString()
        )}
        {' MAU'}
        {mauUsagePercent && ` (${(mauUsagePercent * 100).toFixed(2)}%)`}
      </div>
      <div className={styles.planCycle}>
        <DynamicT
          forKey="subscription.plan_cycle"
          interpolation={{
            period: formatPeriod({
              periodStart: currentPeriodStart,
              periodEnd: currentPeriodEnd,
            }),
            renewDate: dayjs(currentPeriodEnd).add(1, 'day').format('MMM D, YYYY'),
          }}
        />
      </div>
      {mauUsagePercent && (
        <div className={styles.usageBar}>
          <div
            className={classNames(styles.usageBarInner, mauUsagePercent >= 1 && styles.overuse)}
            style={{ width: `${Math.min(mauUsagePercent, 1) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default PlanUsage;
