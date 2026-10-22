import { type ResponseError } from '@withtyped/client';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import useCurrentUser from '@/hooks/use-current-user';

import { type PendingConnectorCreation } from './connector-creation-idempotency';
import { getIncludedCapacity } from './creation-billing';

const useConsoleSsoCoverage = (isEnabled: boolean) => {
  const { user } = useCurrentUser();
  const api = useCloudApi();
  const result = useSWR<
    ReturnType<typeof getIncludedCapacity> & { enterpriseId?: string },
    ResponseError
  >(
    user && isEnabled && ['console-sso-coverage', user.id],
    async () => {
      // Use the same first Enterprise as connector creation; never combine different contracts.
      const { logtoEnterprises } = await api.get('/api/me/logto-enterprises');
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
    },
    // Reopening the modal must check current allowance before selecting funding.
    { dedupingInterval: 0 }
  );
  return result;
};

export const useCreationBilling = (operation?: PendingConnectorCreation) => {
  // Saved payment/fulfillment recovery takes precedence over a new funding decision.
  const isRecovering = Boolean(operation?.funding);
  const coverage = useConsoleSsoCoverage(!isRecovering);
  const funding = operation?.funding ?? (coverage.data?.isAvailable ? 'included' : 'personal');
  const billingError = isRecovering ? undefined : coverage.error;
  const isBillingReady = isRecovering || (Boolean(coverage.data) && !coverage.isValidating);
  const enterpriseId = isRecovering ? operation?.enterpriseId : coverage.data?.enterpriseId;
  return {
    funding,
    enterpriseId: funding === 'included' ? enterpriseId : undefined,
    billingError,
    isBillingReady,
  };
};
