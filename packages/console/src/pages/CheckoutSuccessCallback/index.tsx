import { conditional, conditionalString } from '@silverhand/essentials';
import dayjs from 'dayjs';
import { useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import PlanName from '@/components/PlanName';
import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';
import { clearLocalCheckoutSession, getLocalCheckoutSession } from '@/utils/checkout';

const consoleHomePage = '/';
const subscriptionCheckingInterval = 1000;
const subscriptionCheckingTimeout = 10 * 1000;

function CheckoutSuccessCallback() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const navigate = useNavigate();
  const cloudApi = useCloudApi();
  const { currentTenantId, navigateTenant } = useContext(TenantsContext);
  const { search } = useLocation();
  const checkoutState = new URLSearchParams(search).get(checkoutStateQueryKey);
  const { state, sessionId, callbackPage, isDowngrade } = getLocalCheckoutSession() ?? {};
  const { data: subscriptionPlans, error: fetchPlansError } = useSubscriptionPlans();
  const isLoadingPlans = !subscriptionPlans && !fetchPlansError;

  // Note: if we can't get the subscription results in 10 seconds, we will redirect to the console home page
  useTimer({
    autoStart: true,
    expiryTimestamp: dayjs().add(subscriptionCheckingTimeout, 'millisecond').toDate(),
    onExpire: () => {
      // Todo @xiaoyijun align with the designer for the fallback message
      toast.error('Subscription status check timed out. Please try refreshing the page later.');
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
  const checkoutPlanId = stripeCheckoutSession?.planId;

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
    !isLoadingPlans &&
    checkoutTenantId &&
    stripeCheckoutSession.status === 'complete' &&
    checkoutPlanId === tenantSubscription?.planId;

  useEffect(() => {
    if (isCheckoutSuccessful) {
      clearLocalCheckoutSession();

      const checkoutPlan = subscriptionPlans?.find((plan) => plan.id === checkoutPlanId);
      if (checkoutPlan) {
        toast.success(
          <Trans components={{ name: <PlanName name={checkoutPlan.name} /> }}>
            {t(isDowngrade ? 'downgrade_success' : 'upgrade_success')}
          </Trans>
        );
      }

      if (checkoutTenantId === currentTenantId) {
        navigate(conditional(callbackPage) ?? consoleHomePage, { replace: true });
        return;
      }

      // Note: the tenant is created after checkout.
      navigateTenant(checkoutTenantId);
    }
  }, [
    callbackPage,
    checkoutPlanId,
    checkoutTenantId,
    currentTenantId,
    isCheckoutSuccessful,
    isDowngrade,
    navigate,
    navigateTenant,
    subscriptionPlans,
    t,
  ]);

  if (!isValidSession && !isLoadingPlans) {
    return <Navigate replace to={consoleHomePage} />;
  }

  return <AppLoading />;
}

export default CheckoutSuccessCallback;
