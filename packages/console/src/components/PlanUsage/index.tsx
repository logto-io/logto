import { conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import dayjs from 'dayjs';

import { type SubscriptionUsage, type Subscription } from '@/cloud/types/router';
import DynamicT from '@/ds-components/DynamicT';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { formatPeriod } from '@/utils/subscription';

import * as styles from './index.module.scss';

type Props = {
  readonly subscriptionUsage: SubscriptionUsage;
  readonly currentSubscription: Subscription;
  readonly currentPlan: SubscriptionPlan;
};

function PlanUsage({ subscriptionUsage, currentSubscription, currentPlan }: Props) {
  const { currentPeriodStart, currentPeriodEnd } = currentSubscription;
  const { activeUsers } = subscriptionUsage;
  const {
    quota: { mauLimit },
  } = currentPlan;

  const usagePercent = conditional(mauLimit && activeUsers / mauLimit);

  return (
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
