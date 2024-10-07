import { ReservedPlanId } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useContext, useMemo, useState } from 'react';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type NewSubscriptionPeriodicUsage } from '@/cloud/types/router';
import { subscriptionPage } from '@/consts/pages';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import { NotEligibleSwitchSkuModalContent } from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import { parseExceededSkuQuotaLimitError } from '@/utils/subscription';

type Props = {
  readonly className?: string;
  readonly periodicUsage?: NewSubscriptionPeriodicUsage;
};

function MauLimitExceededNotification({ periodicUsage: rawPeriodicUsage, className }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { subscribe } = useSubscribe();
  const { show } = useConfirmModal();
  const { subscriptionPlans, logtoSkus, currentSubscriptionQuota } =
    useContext(SubscriptionDataContext);
  const { currentTenant } = useContext(TenantsContext);

  const [isLoading, setIsLoading] = useState(false);
  const proPlan = useMemo(
    () => subscriptionPlans.find(({ id }) => id === ReservedPlanId.Pro),
    [subscriptionPlans]
  );
  const proSku = useMemo(() => logtoSkus.find(({ id }) => id === ReservedPlanId.Pro), [logtoSkus]);

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

  const { mauLimit } = currentSubscriptionQuota;

  if (
    mauLimit === null || // Unlimited
    periodicUsage.mauLimit < mauLimit ||
    !proPlan ||
    !proSku
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
            skuId: proSku.id,
            planId: proPlan.id,
            tenantId: currentTenantId,
            callbackPage: subscriptionPage,
          });
          setIsLoading(false);
        } catch (error: unknown) {
          setIsLoading(false);

          const [result, exceededSkuQuotaKeys] = await parseExceededSkuQuotaLimitError(error);

          if (result) {
            await show({
              ModalContent: () => (
                <NotEligibleSwitchSkuModalContent
                  targetSku={proSku}
                  exceededSkuQuotaKeys={exceededSkuQuotaKeys}
                />
              ),
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
