import { ReservedPlanId } from '@logto/schemas';
import dayjs from 'dayjs';
import { nanoid } from 'nanoid';
import { useContext, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type CreateTenantData } from '@/components/CreateTenantModal/types';
import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { GlobalRoute, TenantsContext } from '@/contexts/TenantsProvider';
import { createLocalCheckoutSession } from '@/utils/checkout';
import { dropLeadingSlash } from '@/utils/url';

import useTenantPathname from './use-tenant-pathname';

type SubscribeProps = {
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
  const { getUrl } = useTenantPathname();
  const [isSubscribeLoading, setIsSubscribeLoading] = useState(false);

  const subscribe = async ({
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
    visitManagePaymentPage,
  };
};

export default useSubscribe;
