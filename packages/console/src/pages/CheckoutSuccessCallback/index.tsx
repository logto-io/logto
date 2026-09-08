import { conditional, conditionalString } from '@silverhand/essentials';
import { useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trans, useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';
import { useTimer } from 'react-timer-hook';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import AppLoading from '@/components/AppLoading';
import { GtagConversionId, reportToGoogle } from '@/components/Conversion/utils';
import SkuName from '@/components/SkuName';
import { checkoutStateQueryKey } from '@/consts/subscriptions';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';
import Button from '@/ds-components/Button';
import useTenantPathname from '@/hooks/use-tenant-pathname';
import { clearLocalCheckoutSession, getLocalCheckoutSession } from '@/utils/checkout';

import styles from './index.module.scss';

const consoleHomePage = '/';
const subscriptionCheckingInterval = 1000;
const subscriptionCheckingTimeout = 60 * 1000;

const getExpiryTimestamp = () => new Date(Date.now() + subscriptionCheckingTimeout);

function CheckoutSuccessCallback() {
  const { t } = useTranslation(undefined, { keyPrefix: 'admin_console.subscription' });
  const { navigate } = useTenantPathname();
  const cloudApi = useCloudApi({ hideErrorToast: true });
  const { currentTenantId, navigateTenant, updateTenant } = useContext(TenantsContext);
  const { onCurrentSubscriptionUpdated } = useContext(SubscriptionDataContext);
  const { search } = useLocation();
  const checkoutState = new URLSearchParams(search).get(checkoutStateQueryKey);
  const { state, sessionId, callbackPage, isDowngrade } = getLocalCheckoutSession() ?? {};
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Provisioning can outlast the timer. Expiry only pauses polling and keeps the local checkout
  // session, so a refresh or "Try again" resumes the check.
  const { restart } = useTimer({
    autoStart: true,
    expiryTimestamp: getExpiryTimestamp(),
    onExpire: () => {
      setIsTimedOut(true);
    },
  });

  const refreshInterval = isTimedOut ? 0 : subscriptionCheckingInterval;

  // Note: only handle the callback comes from the stripe success callback url
  const isValidSession = state && state === checkoutState;

  const { data: stripeCheckoutSession, mutate: mutateStripeCheckoutSession } = useSWR(
    isValidSession && sessionId && `/api/checkout-session/${sessionId}`,
    async () =>
      cloudApi.get('/api/checkout-session/:id', {
        params: {
          id: conditionalString(sessionId),
        },
      }),
    { refreshInterval }
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
    { refreshInterval }
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

  if (isTimedOut) {
    return (
      <div className={styles.container}>
        <div className={styles.message}>{t('subscription_check_pending')}</div>
        <Button
          title="general.retry"
          size="large"
          onClick={() => {
            setIsTimedOut(false);
            restart(getExpiryTimestamp());
            void mutateStripeCheckoutSession();
          }}
        />
      </div>
    );
  }

  return <AppLoading />;
}

export default CheckoutSuccessCallback;
