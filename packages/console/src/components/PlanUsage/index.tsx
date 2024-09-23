import { ReservedPlanId } from '@logto/schemas';
import { cond, conditional } from '@silverhand/essentials';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useContext, useMemo } from 'react';

import {
  type NewSubscriptionPeriodicUsage,
  type NewSubscriptionCountBasedUsage,
} from '@/cloud/types/router';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import { formatPeriod, isPaidPlan } from '@/utils/subscription';

import PlanUsageCard, { type Props as PlanUsageCardProps } from './PlanUsageCard';
import styles from './index.module.scss';
import {
  type UsageKey,
  usageKeys,
  usageKeyPriceMap,
  usageKeyMap,
  titleKeyMap,
  tooltipKeyMap,
  enterpriseTooltipKeyMap,
  enterpriseUsageKeyMap,
} from './utils';

type Props = {
  readonly periodicUsage?: NewSubscriptionPeriodicUsage;
};

const getUsageByKey = (
  key: keyof UsageKey,
  {
    periodicUsage,
    countBasedUsage,
  }: {
    periodicUsage: NewSubscriptionPeriodicUsage;
    countBasedUsage: NewSubscriptionCountBasedUsage;
  }
) => {
  if (key === 'mauLimit' || key === 'tokenLimit') {
    return periodicUsage[key];
  }

  if (key === 'organizationsLimit') {
    return countBasedUsage[key] > 0;
  }

  return countBasedUsage[key];
};

function PlanUsage({ periodicUsage: rawPeriodicUsage }: Props) {
  const {
    currentSubscriptionQuota,
    currentSubscriptionBasicQuota,
    currentSubscriptionUsage,
    currentSubscription: {
      currentPeriodStart,
      currentPeriodEnd,
      planId,
      isAddOnAvailable,
      isEnterprisePlan,
    },
  } = useContext(SubscriptionDataContext);
  const { currentTenant } = useContext(TenantsContext);

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

  const onlyShowPeriodicUsage =
    planId === ReservedPlanId.Free || (!isAddOnAvailable && planId === ReservedPlanId.Pro);

  const usages: PlanUsageCardProps[] = usageKeys
    // Show all usages for Pro plan and only show MAU and token usage for Free plan
    .filter(
      (key) =>
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        isAddOnAvailable ||
        // TODO: design a flow for enterprise tenants onboarding.
        // Show all usages for Enterprise plan since some of the enterprise tenants does not have Stripe subscription, as a result, the `isAddOnAvailable` will be undefined in this case, even if we will deprecate `isAddOnAvailable` soon, the plan usage will not be automatically fixed for these enterprise tenants.
        isEnterprisePlan ||
        (onlyShowPeriodicUsage && (key === 'mauLimit' || key === 'tokenLimit'))
    )
    .map((key) => ({
      usage: getUsageByKey(key, { periodicUsage, countBasedUsage: currentSubscriptionUsage }),
      usageKey: `subscription.usage.${usageKeyMap[key]}`,
      titleKey: `subscription.usage.${titleKeyMap[key]}`,
      unitPrice: usageKeyPriceMap[key],
      ...conditional(
        planId === ReservedPlanId.Pro && {
          tooltipKey: `subscription.usage.${tooltipKeyMap[key]}`,
        }
      ),
      ...conditional(
        isEnterprisePlan && {
          usageKey: `subscription.usage.${enterpriseUsageKeyMap[key]}`,
          tooltipKey: `subscription.usage.${enterpriseTooltipKeyMap[key]}`,
        }
      ),
      ...cond(
        (key === 'tokenLimit' || key === 'mauLimit' || isPaidPlan(planId, isEnterprisePlan)) &&
          // Do not show `xxx / 0` in displaying usage.
          currentSubscriptionQuota[key] !== 0 && {
            quota: currentSubscriptionQuota[key],
          }
      ),
      ...cond(
        isPaidPlan(planId, isEnterprisePlan) && {
          basicQuota: currentSubscriptionBasicQuota[key],
        }
      ),
    }));

  return (
    <div>
      <div className={classNames(styles.planCycle, styles.planCycleNewPricingModel)}>
        <DynamicT
          forKey="subscription.plan_cycle"
          interpolation={{
            period: formatPeriod({
              periodStart: currentPeriodStart,
              periodEnd: currentPeriodEnd,
            }),
            renewDate: dayjs(currentPeriodEnd).format('MMM D, YYYY'),
          }}
        />
      </div>
      <div className={styles.newPricingModelUsage}>
        {usages.map((props, index) => (
          <PlanUsageCard
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            className={classNames(styles.cardItem, onlyShowPeriodicUsage && styles.periodicUsage)}
            {...props}
          />
        ))}
      </div>
    </div>
  );
}

export default PlanUsage;
