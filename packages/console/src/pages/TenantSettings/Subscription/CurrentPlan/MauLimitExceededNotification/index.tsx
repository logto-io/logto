import { useContext } from 'react';

import { subscriptionPage } from '@/consts/pages';
import { ReservedPlanId } from '@/consts/subscriptions';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import useSubscribe from '@/hooks/use-subscribe';
import { type SubscriptionPlan } from '@/types/subscriptions';

type Props = {
  activeUsers: number;
  currentPlan: SubscriptionPlan;
  className?: string;
};

function MauLimitExceededNotification({ activeUsers, currentPlan, className }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { subscribe } = useSubscribe();
  const {
    quota: { mauLimit },
  } = currentPlan;
  if (
    mauLimit === null || // Unlimited
    activeUsers < mauLimit
  ) {
    return null;
  }

  return (
    <InlineNotification
      severity="error"
      action="subscription.upgrade_pro"
      className={className}
      onClick={() => {
        void subscribe({
          planId: ReservedPlanId.pro,
          tenantId: currentTenantId,
          callbackPage: subscriptionPage,
        });
      }}
    >
      <DynamicT forKey="subscription.overfill_quota_warning" />
    </InlineNotification>
  );
}

export default MauLimitExceededNotification;
