import { ReservedPlanId } from '@logto/schemas';
import { useContext, useMemo, useState } from 'react';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { subscriptionPage } from '@/consts/pages';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';
import NotEligibleSwitchPlanModalContent from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import { type SubscriptionPlan } from '@/types/subscriptions';
import { isExceededQuotaLimitError } from '@/utils/subscription';

type Props = {
  activeUsers: number;
  currentPlan: SubscriptionPlan;
  className?: string;
};

function MauLimitExceededNotification({ activeUsers, currentPlan, className }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { subscribe } = useSubscribe();
  const { show } = useConfirmModal();
  const { data: subscriptionPlans } = useSubscriptionPlans();
  const [isLoading, setIsLoading] = useState(false);
  const proPlan = useMemo(
    () => subscriptionPlans?.find(({ id }) => id === ReservedPlanId.Pro),
    [subscriptionPlans]
  );

  const {
    quota: { mauLimit },
  } = currentPlan;

  if (
    mauLimit === null || // Unlimited
    activeUsers < mauLimit ||
    !proPlan
  ) {
    return null;
  }

  return (
    <InlineNotification
      severity="error"
      action="subscription.upgrade_pro"
      className={className}
      isActionLoading={isLoading}
      onClick={async () => {
        try {
          setIsLoading(true);
          await subscribe({
            planId: proPlan.id,
            tenantId: currentTenantId,
            callbackPage: subscriptionPage,
          });
          setIsLoading(false);
        } catch (error: unknown) {
          setIsLoading(false);

          if (await isExceededQuotaLimitError(error)) {
            await show({
              ModalContent: () => <NotEligibleSwitchPlanModalContent targetPlan={proPlan} />,
              title: 'subscription.not_eligible_modal.upgrade_title',
              confirmButtonText: 'general.got_it',
              confirmButtonType: 'primary',
              isCancelButtonVisible: false,
            });
            return;
          }

          void toastResponseError(error);
        }
      }}
    >
      <DynamicT forKey="subscription.overfill_quota_warning" />
    </InlineNotification>
  );
}

export default MauLimitExceededNotification;
