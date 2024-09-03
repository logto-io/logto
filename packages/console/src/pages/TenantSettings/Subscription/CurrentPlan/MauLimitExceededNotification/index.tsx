import { ReservedPlanId } from '@logto/schemas';
import { useContext, useMemo, useState } from 'react';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { isDevFeaturesEnabled } from '@/consts/env';
import { subscriptionPage } from '@/consts/pages';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import DynamicT from '@/ds-components/DynamicT';
import InlineNotification from '@/ds-components/InlineNotification';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import NotEligibleSwitchPlanModalContent, {
  NotEligibleSwitchSkuModalContent,
} from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import { type SubscriptionPlan } from '@/types/subscriptions';
import {
  parseExceededQuotaLimitError,
  parseExceededSkuQuotaLimitError,
} from '@/utils/subscription';

type Props = {
  /** @deprecated No need to pass in this argument in new pricing model */
  readonly activeUsers: number;
  /** @deprecated No need to pass in this argument in new pricing model */
  readonly currentPlan: SubscriptionPlan;
  readonly className?: string;
};

function MauLimitExceededNotification({ activeUsers, currentPlan, className }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { subscribe } = useSubscribe();
  const { show } = useConfirmModal();
  const { subscriptionPlans, logtoSkus, currentSubscriptionQuota, currentSubscriptionUsage } =
    useContext(SubscriptionDataContext);

  const [isLoading, setIsLoading] = useState(false);
  const proPlan = useMemo(
    () => subscriptionPlans.find(({ id }) => id === ReservedPlanId.Pro),
    [subscriptionPlans]
  );
  const proSku = useMemo(() => logtoSkus.find(({ id }) => id === ReservedPlanId.Pro), [logtoSkus]);

  const {
    quota: { mauLimit: oldPricingModelMauLimit },
  } = currentPlan;

  // Should be safe to access `mauLimit` here since we have excluded the case where `isDevFeaturesEnabled` is `true` but `currentSubscriptionQuota` is `null` in the above condition.
  const mauLimit = isDevFeaturesEnabled
    ? currentSubscriptionQuota.mauLimit
    : oldPricingModelMauLimit;

  if (
    mauLimit === null || // Unlimited
    (isDevFeaturesEnabled ? currentSubscriptionUsage.mauLimit : activeUsers) < mauLimit ||
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

          if (isDevFeaturesEnabled) {
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
          }

          const [result, exceededQuotaKeys] = await parseExceededQuotaLimitError(error);

          if (result) {
            await show({
              ModalContent: () => (
                <NotEligibleSwitchPlanModalContent
                  targetPlan={proPlan}
                  exceededQuotaKeys={exceededQuotaKeys}
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
