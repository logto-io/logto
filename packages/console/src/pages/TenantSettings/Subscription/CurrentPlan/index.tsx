import { useContext, useMemo } from 'react';

import { type TenantUsageAddOnSkus, type SubscriptionPeriodicUsage } from '@/cloud/types/router';
import BillInfo from '@/components/BillInfo';
import FormCard from '@/components/FormCard';
import PlanDescription from '@/components/PlanDescription';
import PlanUsage from '@/components/PlanUsage';
import SkuName from '@/components/SkuName';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import FormField from '@/ds-components/FormField';
import { isPaidPlan } from '@/utils/subscription';

import AddOnUsageChangesNotification from './AddOnUsageChangesNotification';
import MauLimitExceedNotification from './MauLimitExceededNotification';
import PaymentOverdueNotification from './PaymentOverdueNotification';
import TokenLimitExceededNotification from './TokenLimitExceededNotification';
import styles from './index.module.scss';

type Props = {
  readonly periodicUsage?: SubscriptionPeriodicUsage;
  readonly usageAddOnSkus?: TenantUsageAddOnSkus;
};

function CurrentPlan({ periodicUsage, usageAddOnSkus }: Props) {
  const {
    currentSku: { unitPrice },
    currentSubscription: { upcomingInvoice, isEnterprisePlan, planId, quotaScope },
  } = useContext(SubscriptionDataContext);

  /**
   * After the new pricing model goes live, `upcomingInvoice` will always exist. `upcomingInvoice` is updated more frequently than `currentSubscription.upcomingInvoice`.
   * However, for compatibility reasons, the price of the SKU's corresponding `unitPrice` will be used as a fallback when it does not exist. If `unitPrice` also does not exist, it means that the tenant does not have any applicable paid subscription, and the bill will be 0.
   */
  const upcomingCost = useMemo(
    () => upcomingInvoice?.subtotal ?? unitPrice ?? 0,
    [unitPrice, upcomingInvoice]
  );

  if (!periodicUsage) {
    return null;
  }

  return (
    <FormCard title="subscription.current_plan" description="subscription.current_plan_description">
      <div className={styles.planInfo}>
        <div className={styles.name}>
          <SkuName skuId={planId} />
        </div>
        <div className={styles.description}>
          <PlanDescription skuId={planId} isEnterprisePlan={isEnterprisePlan} />
        </div>
      </div>
      <FormField title="subscription.plan_usage">
        <PlanUsage periodicUsage={periodicUsage} usageAddOnSkus={usageAddOnSkus} />
      </FormField>
      {/* Only show usageExceed and payment info if the subscription quota scope is dedicated */}
      {quotaScope === 'dedicated' && (
        <>
          <FormField title="subscription.next_bill">
            <BillInfo
              cost={upcomingCost}
              isManagePaymentVisible={isPaidPlan(planId, isEnterprisePlan)}
            />
          </FormField>
          {isPaidPlan(planId, isEnterprisePlan) && !isEnterprisePlan && (
            <AddOnUsageChangesNotification className={styles.notification} />
          )}
          <TokenLimitExceededNotification
            periodicUsage={periodicUsage}
            className={styles.notification}
          />
          <MauLimitExceedNotification
            periodicUsage={periodicUsage}
            className={styles.notification}
          />
          <PaymentOverdueNotification className={styles.notification} />
        </>
      )}
    </FormCard>
  );
}

export default CurrentPlan;
