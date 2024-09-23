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
  titleKeyMap,
  tooltipKeyMap,
  enterpriseTooltipKeyMap,
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

  // Show organization usage status in in-use/not-in-use state.
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

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);
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
      usageKey: 'subscription.usage.usage_description_with_limited_quota',
      titleKey: `subscription.usage.${titleKeyMap[key]}`,
      unitPrice: usageKeyPriceMap[key],
      ...cond(
        (key === 'tokenLimit' || key === 'mauLimit' || isPaidTenant) && {
          quota: currentSubscriptionQuota[key],
        }
      ),
      ...cond(
        isPaidTenant && {
          tooltipKey: `subscription.usage.${
            isEnterprisePlan ? enterpriseTooltipKeyMap[key] : tooltipKeyMap[key]
          }`,
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
