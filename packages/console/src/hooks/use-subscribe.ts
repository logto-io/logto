import { nanoid } from 'nanoid';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type CreateTenantData } from '@/components/CreateTenantModal/types';
import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { GlobalRoute, TenantsContext } from '@/contexts/TenantsProvider';
import { createLocalCheckoutSession } from '@/utils/checkout';
import { dropLeadingSlash } from '@/utils/url';

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
  const { updateTenant } = useContext(TenantsContext);
  const { mutateSubscriptionQuotaAndUsages, onCurrentSubscriptionUpdated } =
    useContext(SubscriptionDataContext);

  const { getUrl } = useTenantPathname();
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

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

    const subscription = await cloudApi.get('/api/tenants/:tenantId/subscription', {
      params: {
        tenantId,
      },
    });

    mutateSubscriptionQuotaAndUsages();
    onCurrentSubscriptionUpdated(subscription);
    const { id, ...rest } = subscription;

    updateTenant(tenantId, {
      planId: rest.planId,
      subscription: rest,
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

      window.open(redirectUri, '_blank', 'noopener,noreferrer');
    } catch (error: unknown) {
      void toastResponseError(error);
    }
  };

  return {
    isSubscribeLoading,
    subscribe,
    cancelSubscription,
    visitManagePaymentPage,
  };
};

export default useSubscribe;
