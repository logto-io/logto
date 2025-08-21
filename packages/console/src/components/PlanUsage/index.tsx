import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import classNames from 'classnames';
import dayjs from 'dayjs';
import { useContext } from 'react';

import { type NewSubscriptionPeriodicUsage, type TenantUsageAddOnSkus } from '@/cloud/types/router';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import DynamicT from '@/ds-components/DynamicT';
import { formatPeriod, isPaidPlan } from '@/utils/subscription';

import PlanUsageCard, { type Props as PlanUsageCardProps } from './PlanUsageCard';
import styles from './index.module.scss';
import {
  usageKeys,
  usageKeyPriceMap,
  titleKeyMap,
  getUsageByKey,
  getQuotaByKey,
  getToolTipByKey,
  shouldHideQuotaNotice,
  filterNewUsageKeysForLegacyPro,
} from './utils';

type Props = {
  readonly periodicUsage: NewSubscriptionPeriodicUsage | undefined;
  readonly usageAddOnSkus?: TenantUsageAddOnSkus;
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
    // TODO: remove this filter after the pro plan migration is complete.
    .filter((key) => {
      return filterNewUsageKeysForLegacyPro(key, planId);
    })
    .map((key) => {
      return {
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
        quota: getQuotaByKey(key, currentSubscriptionQuota),
        ...cond(
          isPaidTenant && {
            basicQuota: getQuotaByKey(key, currentSubscriptionBasicQuota),
            tooltipKey: getToolTipByKey(key, currentSubscriptionBasicQuota, isEnterprisePlan),
          }
        ),
        isQuotaNoticeHidden: shouldHideQuotaNotice(key, currentSubscriptionBasicQuota, planId),
      };
    });

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
