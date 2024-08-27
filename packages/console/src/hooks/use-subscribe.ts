import { ReservedPlanId } from '@logto/schemas';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { useCallback, useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type CreateTenantData } from '@/components/CreateTenantModal/types';
import { isDevFeaturesEnabled } from '@/consts/env';
import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { GlobalRoute, TenantsContext } from '@/contexts/TenantsProvider';
import { createLocalCheckoutSession } from '@/utils/checkout';
import { dropLeadingSlash } from '@/utils/url';

import useNewSubscriptionQuota from './use-new-subscription-quota';
import useNewSubscriptionScopeUsage from './use-new-subscription-scopes-usage';
import useNewSubscriptionUsage from './use-new-subscription-usage';
import useSubscription from './use-subscription';
import useTenantPathname from './use-tenant-pathname';

type SubscribeProps = {
  /**
   * @remarks
   * Temporarily mark this as optional for backward compatibility, in new pricing model we should always provide `skuId`.
   */
  skuId?: string;
  /** @deprecated in new pricing model */
  planId: string;
  callbackPage?: string;
  tenantId?: string;
  tenantData?: CreateTenantData;
  isDowngrade?: boolean;
};

const useSubscribe = () => {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const cloudApi = useCloudApi({ hideErrorToast: true });
  const { updateTenant, currentTenantId } = useContext(TenantsContext);
  const { getUrl } = useTenantPathname();
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

  const { mutate: mutateSubscription } = useSubscription(currentTenantId);
  const { mutate: mutateSubscriptionQuota } = useNewSubscriptionQuota(currentTenantId);
  const { mutate: mutateSubscriptionUsage } = useNewSubscriptionUsage(currentTenantId);
  const {
    scopeResourceUsage: { mutate: mutateScopeResourceUsage },
    scopeRoleUsage: { mutate: mutateScopeRoleUsage },
  } = useNewSubscriptionScopeUsage(currentTenantId);

  const syncSubscriptionData = useCallback(() => {
    void mutateSubscription();
    if (isDevFeaturesEnabled) {
      void mutateSubscriptionQuota();
      void mutateSubscriptionUsage();
      void mutateScopeResourceUsage();
      void mutateScopeRoleUsage();
    }
  }, [
    mutateScopeResourceUsage,
    mutateScopeRoleUsage,
    mutateSubscription,
    mutateSubscriptionQuota,
    mutateSubscriptionUsage,
  ]);

  const subscribe = async ({
    skuId,
    planId,
    callbackPage,
    tenantId,
    tenantData,
    isDowngrade = false,
  }: SubscribeProps) => {
    if (isSubscribeLoading) {
      return;
    }
    setIsSubscribeLoading(true);

    const state = nanoid(6);

    const successSearchParam = new URLSearchParams({
      [checkoutStateQueryKey]: state,
    });

    const successCallbackUrl = getUrl(
      `${dropLeadingSlash(GlobalRoute.CheckoutSuccessCallback)}?${successSearchParam.toString()}`
    ).href;

    try {
      const { redirectUri, sessionId } = await cloudApi.post('/api/checkout-session', {
        body: {
          skuId,
          planId,
          successCallbackUrl,
          tenantId,
          tenantName: tenantData?.name,
          tenantTag: tenantData?.tag,
          tenantRegionName: tenantData?.regionName,
        },
      });

      if (!redirectUri) {
        toast.error(t('general.unknown_error'));
        return;
      }

      createLocalCheckoutSession({
        state,
        sessionId,
        callbackPage,
        isDowngrade,
      });

      window.location.assign(redirectUri);
    } finally {
      setIsSubscribeLoading(false);
    }
  };

  const cancelSubscription = async (tenantId: string) => {
    await cloudApi.delete('/api/tenants/:tenantId/subscription', {
      params: {
        tenantId,
      },
    });

    // Should not use hard-coded plan update here, need to update the tenant's subscription data with response from corresponding API.
    if (isDevFeaturesEnabled) {
      const { id, ...rest } = await cloudApi.get('/api/tenants/:tenantId/subscription', {
        params: {
          tenantId,
        },
      });

      syncSubscriptionData();
      updateTenant(tenantId, {
        planId: rest.planId,
        subscription: rest,
      });
      return;
    }

    /**
     * Note: need to update the tenant's subscription cache data,
     * since the cancel subscription flow will not redirect to the stripe payment page.
     */
    updateTenant(tenantId, {
      planId: ReservedPlanId.Free,
      subscription: {
        status: 'active',
        planId: ReservedPlanId.Free,
        currentPeriodStart: dayjs().toDate(),
        currentPeriodEnd: dayjs().add(1, 'month').toDate(),
      },
    });
  };

  const visitManagePaymentPage = async (tenantId: string) => {
    try {
      const { redirectUri } = await cloudApi.post('/api/tenants/:tenantId/stripe-customer-portal', {
        params: {
          tenantId,
        },
        body: {
          callbackUrl: window.location.href,
        },
      });

      window.location.assign(redirectUri);
    } catch (error: unknown) {
      void toastResponseError(error);
    }
  };

  return {
    isSubscribeLoading,
    subscribe,
    cancelSubscription,
    syncSubscriptionData,
    visitManagePaymentPage,
  };
};

export default useSubscribe;
