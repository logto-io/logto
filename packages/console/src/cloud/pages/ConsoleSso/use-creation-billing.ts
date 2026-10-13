import { type consoleSsoRouter } from '@logto/cloud/routes';
import { type GuardedResponse, type ResponseError, type RouterRoutes } from '@withtyped/client';
import { useState } from 'react';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import { type PendingConnectorCreation } from './connector-creation-idempotency';
import { getIncludedCapacity } from './creation-billing';

export const useConsoleSsoCheckoutPreview = () => {
  const { user } = useCurrentUser();
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  return useSWR<
    GuardedResponse<
      RouterRoutes<typeof consoleSsoRouter>['get']['/api/me/console-sso/checkout-preview']
    >,
    ResponseError
  >(
    user && ['/api/me/console-sso/checkout-preview', user.id],
    async () => api.get('/api/me/console-sso/checkout-preview'),
    { keepPreviousData: false }
  );
};

export const useConsoleSsoCoverage = () => {
  const { user } = useCurrentUser();
  const api = useCloudApi({ hideErrorToast: true });
  const result = useSWR<ReturnType<typeof getIncludedCapacity>, ResponseError>(
    user && ['console-sso-coverage', user.id],
    async () => {
      // Use the same first Enterprise as connector creation; never combine different contracts.
      const { logtoEnterprises } = await api.get('/api/me/logto-enterprises');
      const enterprise = logtoEnterprises[0];
      if (!enterprise) {
        return getIncludedCapacity();
      }
      return getIncludedCapacity(
        await api.get('/api/me/logto-enterprises/:id', {
          params: { id: enterprise.id },
          search: { includeSharedQuota: 'true', includeUsages: 'true' },
        })
      );
    },
    { keepPreviousData: false }
  );
  return result;
};

export const useCreationBilling = (operation?: PendingConnectorCreation) => {
  const preview = useConsoleSsoCheckoutPreview();
  const coverage = useConsoleSsoCoverage();
  const [selectedFunding, setSelectedFunding] = useState<'included' | 'personal'>();
  const funding =
    operation?.funding ?? selectedFunding ?? (coverage.data?.isAvailable ? 'included' : 'personal');
  const subscriptionId =
    preview.data?.status === 'subscription_exists' ? preview.data.subscriptionId : undefined;
  const hasSubscription = Boolean(
    operation?.subscriptionId ?? (!operation?.funding && subscriptionId)
  );
  // Saved payment/fulfillment recovery takes precedence over a new purchase preview.
  const isRecovering = Boolean(operation?.funding);
  const billingError = isRecovering
    ? undefined
    : (coverage.error ?? (funding === 'personal' ? preview.error : undefined));
  const isBillingReady =
    isRecovering || Boolean(coverage.data && (funding === 'included' || preview.data));
  const isIncludedUnavailable =
    funding === 'included' && !isRecovering && !coverage.data?.isAvailable;
  return {
    preview,
    coverage,
    funding,
    subscriptionId,
    hasSubscription,
    isRecovering,
    billingError,
    isBillingReady,
    isIncludedUnavailable,
    setSelectedFunding,
  };
};
