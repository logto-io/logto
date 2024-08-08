import { ReservedPlanId } from '@logto/schemas';
import { cond, conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useContext } from 'react';

import { type SubscriptionUsage, type Subscription } from '@/cloud/types/router';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { formatPeriod } from '@/utils/subscription';

import ProPlanUsageCard, { type Props as ProPlanUsageCardProps } from './ProPlanUsageCard';
import styles from './index.module.scss';
import { usageKeys, usageKeyMap, titleKeyMap, tooltipKeyMap } from './utils';

type Props = {
  /** @deprecated */
  readonly subscriptionUsage: SubscriptionUsage;
  /** @deprecated */
  readonly currentSubscription: Subscription;
  /** @deprecated */
  readonly currentPlan: SubscriptionPlan;
};

function PlanUsage({ subscriptionUsage, currentSubscription, currentPlan }: Props) {
  const {
    currentSubscriptionQuota,
    currentSubscriptionUsage,
    currentSubscription: currentSubscriptionFromNewPricingModel,
  } = useContext(SubscriptionDataContext);

  const { currentPeriodStart, currentPeriodEnd } = isDevFeaturesEnabled
    ? currentSubscriptionFromNewPricingModel
    : currentSubscription;

  const [activeUsers, mauLimit] = isDevFeaturesEnabled
    ? [currentSubscriptionUsage.mauLimit, currentSubscriptionQuota.mauLimit]
    : [subscriptionUsage.activeUsers, currentPlan.quota.mauLimit];

  const usagePercent = conditional(mauLimit && activeUsers / mauLimit);

  const usages: ProPlanUsageCardProps[] = usageKeys.map((key) => ({
    usage: currentSubscriptionUsage[key],
    usageKey: `subscription.usage.${usageKeyMap[key]}`,
    titleKey: `subscription.usage.${titleKeyMap[key]}`,
    tooltipKey: `subscription.usage.${tooltipKeyMap[key]}`,
    ...cond(
      key === 'tokenLimit' &&
        currentSubscriptionQuota.tokenLimit && { quota: currentSubscriptionQuota.tokenLimit }
    ),
  }));

  return isDevFeaturesEnabled &&
    currentSubscriptionFromNewPricingModel.planId === ReservedPlanId.Pro ? (
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
          // eslint-disable-next-line react/no-array-index-key
          <ProPlanUsageCard key={index} className={styles.cardItem} {...props} />
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
        {usagePercent && ` (${(usagePercent * 100).toFixed(2)}%)`}
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
      {usagePercent && (
        <div className={styles.usageBar}>
          <div
            className={classNames(styles.usageBarInner, usagePercent >= 1 && styles.overuse)}
            style={{ width: `${Math.min(usagePercent, 1) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default PlanUsage;
