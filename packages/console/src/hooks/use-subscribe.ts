import { nanoid } from 'nanoid';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type CreateTenantData } from '@/components/CreateTenantModal/type';
import { checkoutStateQueryKey, checkoutSuccessCallbackPath } from '@/consts/subscriptions';
import { createLocalCheckoutSession } from '@/utils/checkout';

import useTenantPathname from './use-tenant-pathname';

type SubscribeProps = {
  planId: string;
  callbackPage?: string;
  tenantId?: string;
  tenantData?: CreateTenantData;
  isDowngrade?: boolean;
};

const useSubscribe = () => {
  const cloudApi = useCloudApi();
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console' });
  const { getUrl } = useTenantPathname();

  const subscribe = async ({
    planId,
    callbackPage,
    tenantId,
    tenantData,
    isDowngrade = false,
  }: SubscribeProps) => {
    const state = nanoid(6);

    const successSearchParam = new URLSearchParams({
      [checkoutStateQueryKey]: state,
    });

    const successCallbackUrl = getUrl(
      `${checkoutSuccessCallbackPath}?${successSearchParam.toString()}`
    ).href;

    const { redirectUri, sessionId } = await cloudApi.post('/api/checkout-session', {
      body: {
        planId,
        successCallbackUrl,
        tenantId,
        tenantName: tenantData?.name,
        tenantTag: tenantData?.tag,
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
  };

  const cancelSubscription = async (tenantId: string) => {
    await cloudApi.delete('/api/tenants/:tenantId/subscription', {
      params: {
        tenantId,
      },
    });
  };

  return {
    subscribe,
    cancelSubscription,
  };
};

export default useSubscribe;
