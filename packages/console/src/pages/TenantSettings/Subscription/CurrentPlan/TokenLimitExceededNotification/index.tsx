import { useContext, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { toastResponseError } from '@/cloud/hooks/use-cloud-api';
import { type SubscriptionPeriodicUsage } from '@/cloud/types/router';
import SkuName from '@/components/SkuName';
import { subscriptionPage } from '@/consts/pages';
import { latestProPlanId } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import InlineNotification from '@/ds-components/InlineNotification';
import { useConfirmModal } from '@/hooks/use-confirm-modal';
import useSubscribe from '@/hooks/use-subscribe';
import { NotEligibleSwitchSkuModalContent } from '@/pages/TenantSettings/components/NotEligibleSwitchPlanModalContent';
import { isPaidPlan, parseExceededSkuQuotaLimitError } from '@/utils/subscription';

type Props = {
  readonly className?: string;
  readonly periodicUsage: SubscriptionPeriodicUsage;
};

function TokenLimitExceededNotification({ periodicUsage, className }: Props) {
  const { currentTenantId } = useContext(TenantsContext);
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });

  const {
    logtoSkus,
    currentSubscriptionQuota,
    currentSubscription: { planId, isEnterprisePlan },
  } = useContext(SubscriptionDataContext);

  const { subscribe } = useSubscribe();
  const { show } = useConfirmModal();

  const [isLoading, setIsLoading] = useState(false);
  const proSku = useMemo(() => logtoSkus.find(({ id }) => id === latestProPlanId), [logtoSkus]);
  const { tokenLimit } = currentSubscriptionQuota;

  const tokenUsagePercent = useMemo(() => {
    // Unlimited
    if (tokenLimit === null) {
      return 0;
    }

    return periodicUsage.tokenLimit / tokenLimit;
  }, [periodicUsage.tokenLimit, tokenLimit]);

  if (
    tokenUsagePercent < 0.9 || // Usage is less than 90%
    isPaidPlan(planId, isEnterprisePlan) || // Add-on enabled
    !proSku // Pro SKU not found
  ) {
    return null;
  }

  const isExceeded = tokenUsagePercent >= 1;

  return (
    <InlineNotification
      severity={isExceeded ? 'error' : 'alert'}
      action="subscription.upgrade_pro"
      className={className}
      isActionLoading={isLoading}
      onClick={async () => {
        try {
          setIsLoading(true);
          await subscribe({
            skuId: proSku.id,
            planId: proSku.id,
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
      <Trans
        components={{
          planName: <SkuName skuId={planId} />,
        }}
      >
        {t(`subscription.token_usage_notification.${isExceeded ? 'exceeded' : 'close_to_limit'}`)}
      </Trans>
    </InlineNotification>
  );
}

export default TokenLimitExceededNotification;
