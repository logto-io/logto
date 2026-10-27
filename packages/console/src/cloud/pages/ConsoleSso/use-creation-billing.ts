import { type ResponseError } from '@withtyped/client';
import useSWR from 'swr';

import { toastResponseError, useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import { type PendingConnectorCreation } from './connector-creation-idempotency';
import { getIncludedCapacity } from './creation-billing';

const useConsoleSsoCoverage = (isEnabled: boolean) => {
  const { user } = useCurrentUser();
  const api = useCloudApi({ hideErrorToast: true });
  const fetchCoverage = async () => {
    const { logtoEnterprises } = await api.get('/api/me/logto-enterprises');
    // Customers currently have at most one Enterprise plan, so only the first is considered.
    // This does not search later entries for available allowance; with multiple plans it may
    // select personal billing even when another Enterprise has allowance.
    const enterprise = logtoEnterprises[0];
    if (!enterprise) {
      return getIncludedCapacity();
    }
    const capacity = getIncludedCapacity(
      await api.get('/api/me/logto-enterprises/:id', {
        params: { id: enterprise.id },
        search: { includeSharedQuota: 'true', includeUsages: 'true' },
      })
    );
    return { ...capacity, enterpriseId: enterprise.id };
  };
  const result = useSWR<
    ReturnType<typeof getIncludedCapacity> & { enterpriseId?: string },
    ResponseError
  >(
    user && isEnabled && ['console-sso-coverage', user.id],
    fetchCoverage,
    // Refresh the preview when reopening; creation also checks current allowance on submit.
    {
      dedupingInterval: 0,
      onError: (error) => {
        void toastResponseError(error);
      },
    }
  );
  return {
    ...result,
    // A plain revalidation can return cached data on failure; submission must propagate errors.
    refresh: async () => result.mutate(fetchCoverage(), { revalidate: false }),
  };
};

export const useCreationBilling = (operation?: PendingConnectorCreation) => {
  // Saved payment/fulfillment recovery takes precedence over a new funding decision.
  const isRecovering = Boolean(operation?.funding);
  const coverage = useConsoleSsoCoverage(!isRecovering);
  const funding = operation?.funding ?? (coverage.data?.isAvailable ? 'included' : 'personal');
  /** Whether `funding` reflects a known source; stays true while a known coverage revalidates. */
  const isFundingResolved = isRecovering || Boolean(coverage.data);
  const billingError = isFundingResolved ? undefined : coverage.error;
  const isBillingReady = isFundingResolved;
  const enterpriseId = isRecovering ? operation?.enterpriseId : coverage.data?.enterpriseId;
  const resolveFunding = async () => {
    if (operation?.funding) {
      return { funding: operation.funding, enterpriseId: operation.enterpriseId };
    }
    const latest = await coverage.refresh();
    if (!latest) {
      throw new Error('Unable to check Console SSO coverage. Please try again.');
    }
    return latest.isAvailable
      ? { funding: 'included' as const, enterpriseId: latest.enterpriseId }
      : { funding: 'personal' as const };
  };
  return {
    funding,
    isFundingResolved,
    enterpriseId: funding === 'included' ? enterpriseId : undefined,
    billingError,
    isBillingReady,
    resolveFunding,
  };
};
