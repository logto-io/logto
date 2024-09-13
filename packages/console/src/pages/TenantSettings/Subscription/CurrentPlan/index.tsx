import { ReservedPlanId } from '@logto/schemas';
import { cond } from '@silverhand/essentials';
import { useContext, useMemo } from 'react';

import { type NewSubscriptionPeriodicUsage } from '@/cloud/types/router';
import BillInfo from '@/components/BillInfo';
import FormCard from '@/components/FormCard';
import PlanDescription from '@/components/PlanDescription';
import PlanUsage from '@/components/PlanUsage';
import SkuName from '@/components/SkuName';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import FormField from '@/ds-components/FormField';

import AddOnUsageChangesNotification from './AddOnUsageChangesNotification';
import MauLimitExceedNotification from './MauLimitExceededNotification';
import PaymentOverdueNotification from './PaymentOverdueNotification';
import styles from './index.module.scss';

type Props = {
  readonly periodicUsage?: NewSubscriptionPeriodicUsage;
};

function CurrentPlan({ periodicUsage: rawPeriodicUsage }: Props) {
  const {
    currentSku: { id, unitPrice },
    currentSubscription: { upcomingInvoice, isEnterprisePlan, isAddOnAvailable, planId },
  } = useContext(SubscriptionDataContext);
  const { currentTenant } = useContext(TenantsContext);

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

  const currentSkuId = isEnterprisePlan ? ReservedPlanId.Enterprise : id;

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
          <SkuName skuId={planId} isEnterprisePlan={isEnterprisePlan} />
        </div>
        <div className={styles.description}>
          <PlanDescription skuId={currentSkuId} planId={planId} />
        </div>
      </div>
      <FormField title="subscription.plan_usage">
        <PlanUsage periodicUsage={rawPeriodicUsage} />
      </FormField>
      <FormField title="subscription.next_bill">
        <BillInfo cost={upcomingCost} isManagePaymentVisible={Boolean(upcomingCost)} />
      </FormField>
      {isAddOnAvailable && !isEnterprisePlan && (
        <AddOnUsageChangesNotification className={styles.notification} />
      )}
      <MauLimitExceedNotification
        periodicUsage={rawPeriodicUsage}
        className={styles.notification}
      />
      <PaymentOverdueNotification className={styles.notification} />
    </FormCard>
  );
}

export default CurrentPlan;
