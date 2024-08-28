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
import { GtagConversionId, reportToGoogle } from '@/components/Conversion/utils';
import PlanName from '@/components/PlanName';
import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { TenantsContext } from '@/contexts/TenantsProvider';
import useSubscriptionPlans from '@/hooks/use-subscription-plans';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { clearLocalCheckoutSession, getLocalCheckoutSession } from '@/utils/checkout';

const consoleHomePage = '/';
const subscriptionCheckingInterval = 1000;
const subscriptionCheckingTimeout = 10 * 1000;

function CheckoutSuccessCallback() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const { navigate } = useTenantPathname();
  const cloudApi = useCloudApi({ hideErrorToast: true });
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

      // No need to check `isDowngrade` here, since a downgrade must occur in a tenant with a Pro
      // plan, and the purchase conversion has already been reported using the same tenant ID. We
      // use the tenant ID as the transaction ID, so there's no concern about duplicate conversion
      // reports.
      reportToGoogle(GtagConversionId.PurchaseProPlan, { transactionId: checkoutTenantId });

      // If the tenant is the current tenant, navigate to the callback page
      if (checkoutTenantId === currentTenantId) {
        navigate(conditional(callbackPage) ?? consoleHomePage, { replace: true });
        return;
      }

      // New tenant created, navigate to the new tenant page
      reportToGoogle(GtagConversionId.CreateProductionTenant, { transactionId: checkoutTenantId });
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
