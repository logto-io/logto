import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useContext } from 'react';

import {
  type NewSubscriptionPeriodicUsage,
  type NewSubscriptionCountBasedUsage,
  type NewSubscriptionQuota,
  type TenantUsageAddOnSkus,
} from '@/cloud/types/router';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import { formatPeriod, isPaidPlan, isProPlan } from '@/utils/subscription';

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
  readonly periodicUsage: NewSubscriptionPeriodicUsage | undefined;
  readonly usageAddOnSkus?: TenantUsageAddOnSkus;
};

const getUsageByKey = (
  key: keyof UsageKey,
  {
    periodicUsage,
    countBasedUsage,
    basicQuota,
  }: {
    periodicUsage: NewSubscriptionPeriodicUsage;
    countBasedUsage: NewSubscriptionCountBasedUsage;
    basicQuota: NewSubscriptionQuota;
  }
) => {
  if (key === 'mauLimit' || key === 'tokenLimit') {
    return periodicUsage[key];
  }

  // Show organization usage status in in-use/not-in-use state.
  if (key === 'organizationsLimit') {
    // If the basic quota is a non-zero number, show the usage in `usage(number-typed) (First {{basicQuota}} included)` format.
    if (typeof basicQuota[key] === 'number' && basicQuota[key] !== 0) {
      return countBasedUsage[key];
    }

    return countBasedUsage[key] > 0;
  }

  return countBasedUsage[key];
};

function PlanUsage({ periodicUsage, usageAddOnSkus }: Props) {
  const {
    currentSubscriptionQuota,
    currentSubscriptionBasicQuota,
    currentSubscriptionUsage,
    currentSubscription: { currentPeriodStart, currentPeriodEnd, planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  if (!periodicUsage) {
    return null;
  }

  const isPaidTenant = isPaidPlan(planId, isEnterprisePlan);
  const onlyShowPeriodicUsage = planId === ReservedPlanId.Free;

  const usages: PlanUsageCardProps[] = usageKeys
    // Show all usages for Pro plan and only show MAU and token usage for Free plan
    .filter(
      (key) =>
        isPaidTenant || (onlyShowPeriodicUsage && (key === 'mauLimit' || key === 'tokenLimit'))
    )
    .map((key) => ({
      usage: getUsageByKey(key, {
        periodicUsage,
        countBasedUsage: currentSubscriptionUsage,
        basicQuota: currentSubscriptionBasicQuota,
      }),
      usageKey: 'subscription.usage.usage_description_with_limited_quota',
      titleKey: `subscription.usage.${titleKeyMap[key]}`,
      unitPrice: usageKeyPriceMap[key],
      // Only support tokenLimit for now
      usageAddOnSku: cond(key === 'tokenLimit' && usageAddOnSkus?.[key]),
      ...cond(
        // We only show the usage card for MAU and token for Free plan
        (key === 'tokenLimit' || key === 'mauLimit' || isPaidTenant) && {
          quota: currentSubscriptionQuota[key],
        }
      ),
      ...cond(
        isPaidTenant && {
          basicQuota: currentSubscriptionBasicQuota[key],
          // Do not show tooltip if the basic quota is null (unlimited) for m2m/API resource add-on.
          ...cond(
            !(
              currentSubscriptionBasicQuota[key] === null &&
              (key === 'machineToMachineLimit' || key === 'resourcesLimit')
            ) && {
              tooltipKey: `subscription.usage.${
                isEnterprisePlan ? enterpriseTooltipKeyMap[key] : tooltipKeyMap[key]
              }`,
            }
          ),
          // Show tooltip for number-typed basic quota for 'organizationsLimit'.
          ...cond(
            key === 'organizationsLimit' &&
              typeof currentSubscriptionBasicQuota[key] === 'number' &&
              currentSubscriptionBasicQuota[key] > 0 && {
                tooltipKey:
                  'subscription.usage.organizations.tooltip_for_enterprise_with_numbered_basic_quota',
              }
          ),
        }
      ),
      // Hide the quota notice for Pro plans if the basic quota is 0.
      // Per current pricing model design, it should apply to `enterpriseSsoLimit`.
      ...cond(
        isProPlan(planId) &&
          currentSubscriptionBasicQuota[key] === 0 && {
            isQuotaNoticeHidden: true,
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
