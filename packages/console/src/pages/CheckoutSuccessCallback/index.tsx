import { conditional, conditionalString } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import SkuName from '@/components/SkuName';
import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { clearLocalCheckoutSession, getLocalCheckoutSession } from '@/utils/checkout';

const consoleHomePage = '/';
const subscriptionCheckingInterval = 1000;
const subscriptionCheckingTimeout = 10 * 1000;

function CheckoutSuccessCallback() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const { navigate } = useTenantPathname();
  const cloudApi = useCloudApi({ hideErrorToast: true });
  const { currentTenantId, navigateTenant, updateTenant } = useContext(TenantsContext);
  const { onCurrentSubscriptionUpdated } = useContext(SubscriptionDataContext);
  const { search } = useLocation();
  const checkoutState = new URLSearchParams(search).get(checkoutStateQueryKey);
  const { state, sessionId, callbackPage, isDowngrade } = getLocalCheckoutSession() ?? {};

  // Note: if we can't get the subscription results in 10 seconds, we will redirect to the console home page
  useTimer({
    autoStart: true,
    expiryTimestamp: dayjs().add(subscriptionCheckingTimeout, 'millisecond').toDate(),
    onExpire: () => {
      toast.error(t('subscription_check_timeout'));
      clearLocalCheckoutSession();
      navigate(consoleHomePage, { replace: true });
    },
  });

  // Note: only handle the callback comes from the stripe success callback url
  const isValidSession = state && state === checkoutState;

  const { data: stripeCheckoutSession } = useSWR(
    isValidSession && sessionId && `/api/checkout-session/${sessionId}`,
    async () =>
      cloudApi.get('/api/checkout-session/:id', {
        params: {
          id: conditionalString(sessionId),
        },
      }),
    {
      refreshInterval: subscriptionCheckingInterval,
    }
  );

  const checkoutTenantId = stripeCheckoutSession?.tenantId;
  const checkoutSkuId = stripeCheckoutSession?.skuId;

  const { data: tenantSubscription } = useSWR(
    checkoutTenantId && `/api/tenants/${checkoutTenantId}/subscription`,
    async () =>
      cloudApi.get('/api/tenants/:tenantId/subscription', {
        params: {
          tenantId: conditionalString(checkoutTenantId),
        },
      }),
    { refreshInterval: subscriptionCheckingInterval }
  );

  const isCheckoutSuccessful =
    checkoutTenantId &&
    stripeCheckoutSession.status === 'complete' &&
    checkoutSkuId === tenantSubscription?.planId;

  useEffect(() => {
    if (isCheckoutSuccessful) {
      clearLocalCheckoutSession();

      // Make the typescript happy checkoutSkuId should not be empty here
      if (checkoutSkuId) {
        toast.success(
          <Trans
            components={{
              name: <SkuName skuId={checkoutSkuId} />,
            }}
          >
            {t(isDowngrade ? 'downgrade_success' : 'upgrade_success')}
          </Trans>
        );
      }

      onCurrentSubscriptionUpdated(tenantSubscription);
      updateTenant(checkoutTenantId, {
        subscription: tenantSubscription,
        ...conditional(tenantSubscription?.planId && { planId: tenantSubscription.planId }),
      });

      // If the tenant is the current tenant, navigate to the callback page
      if (checkoutTenantId === currentTenantId) {
        navigate(conditional(callbackPage) ?? consoleHomePage, { replace: true });
        return;
      }

      // New tenant created, navigate to the new tenant page
      navigateTenant(checkoutTenantId);
    }
  }, [
    callbackPage,
    checkoutSkuId,
    checkoutTenantId,
    currentTenantId,
    isCheckoutSuccessful,
    isDowngrade,
    navigate,
    navigateTenant,
    onCurrentSubscriptionUpdated,
    t,
    tenantSubscription,
    updateTenant,
  ]);

  if (!isValidSession) {
    return <Navigate replace to={consoleHomePage} />;
  }

  return <AppLoading />;
}

export default CheckoutSuccessCallback;
