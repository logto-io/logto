import { cond } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import { type Subscription, type NewSubscriptionPeriodicUsage } from '@/cloud/types/router';
import BillInfo from '@/components/BillInfo';
import ChargeNotification from '@/components/ChargeNotification';
import FormCard from '@/components/FormCard';
import PlanDescription from '@/components/PlanDescription';
import PlanName from '@/components/PlanName';
import PlanUsage from '@/components/PlanUsage';
import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { hasSurpassedQuotaLimit, hasSurpassedSubscriptionQuotaLimit } from '@/utils/quota';

import MauLimitExceedNotification from './MauLimitExceededNotification';
import PaymentOverdueNotification from './PaymentOverdueNotification';
import styles from './index.module.scss';

type Props = {
  /** @deprecated */
  readonly subscription: Subscription;
  /** @deprecated */
  readonly subscriptionPlan: SubscriptionPlan;
  readonly periodicUsage?: NewSubscriptionPeriodicUsage;
};

function CurrentPlan({ subscription, subscriptionPlan, periodicUsage: rawPeriodicUsage }: Props) {
  const { currentSku, currentSubscription, currentSubscriptionQuota } =
    useContext(SubscriptionDataContext);
  const { currentTenant } = useContext(TenantsContext);
  const {
    id,
    name,
    quota: { tokenLimit },
  } = subscriptionPlan;

  const periodicUsage = useMemo(
    () =>
      rawPeriodicUsage ??
      cond(
        currentTenant && {
          mauLimit: currentTenant.usage.activeUsers,
          tokenLimit: currentTenant.usage.tokenUsage,
        }
      ),
    [currentTenant, rawPeriodicUsage]
  );

  /**
   * After the new pricing model goes live, `upcomingInvoice` will always exist. `upcomingInvoice` is updated more frequently than `currentSubscription.upcomingInvoice`.
   * However, for compatibility reasons, the price of the SKU's corresponding `unitPrice` will be used as a fallback when it does not exist. If `unitPrice` also does not exist, it means that the tenant does not have any applicable paid subscription, and the bill will be 0.
   */
  const upcomingCost = useMemo(
    () => currentSubscription.upcomingInvoice?.subtotal ?? currentSku.unitPrice ?? 0,
    [currentSku.unitPrice, currentSubscription.upcomingInvoice]
  );

  if (!periodicUsage) {
    return null;
  }

  const hasTokenSurpassedLimit = isDevFeaturesEnabled
    ? hasSurpassedSubscriptionQuotaLimit({
        quotaKey: 'tokenLimit',
        usage: periodicUsage.tokenLimit,
        quota: currentSubscriptionQuota,
      })
    : hasSurpassedQuotaLimit({
        quotaKey: 'tokenLimit',
        usage: periodicUsage.tokenLimit,
        plan: subscriptionPlan,
      });

  return (
    <FormCard title="subscription.current_plan" description="subscription.current_plan_description">
      <div className={styles.planInfo}>
        <div className={styles.name}>
          <PlanName skuId={currentSku.id} name={name} />
        </div>
        <div className={styles.description}>
          <PlanDescription skuId={currentSku.id} planId={id} />
        </div>
      </div>
      <FormField title="subscription.plan_usage">
        <PlanUsage
          currentSubscription={subscription}
          currentPlan={subscriptionPlan}
          periodicUsage={rawPeriodicUsage}
        />
      </FormField>
      <FormField title="subscription.next_bill">
        <BillInfo cost={upcomingCost} isManagePaymentVisible={Boolean(upcomingCost)} />
      </FormField>
      <MauLimitExceedNotification
        currentPlan={subscriptionPlan}
        periodicUsage={rawPeriodicUsage}
        className={styles.notification}
      />
      <ChargeNotification
        hasSurpassedLimit={hasTokenSurpassedLimit}
        quotaItemPhraseKey="tokens"
        checkedFlagKey="token"
        className={styles.notification}
        quotaLimit={
          cond(
            isDevFeaturesEnabled &&
              typeof currentSubscriptionQuota.tokenLimit === 'number' &&
              currentSubscriptionQuota.tokenLimit
          ) ?? cond(typeof tokenLimit === 'number' && tokenLimit)
        }
      />
      <PaymentOverdueNotification className={styles.notification} />
    </FormCard>
  );
}

export default CurrentPlan;
