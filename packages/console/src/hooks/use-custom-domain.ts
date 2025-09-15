import { DomainStatus, type Domain } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { customDomainSyncInterval } from '@/consts/custom-domain';
import { isCloud } from '@/consts/env';

import { type RequestError } from './use-api';

const useCustomDomain = (autoSync = false) => {
  const { data, error, mutate } = useSWR<Domain[], RequestError>(
    isCloud && 'api/domains',
    conditional(
      autoSync && {
        refreshInterval: customDomainSyncInterval * 1000,
      }
    )
  );

  const isLoading = !data && !error;

  /**
   * Note: we can only create a custom domain, and we don't have a default id for it, so the first element of the array is the custom domain.
   */
  const customDomain = useMemo(() => data?.[0], [data]);

  const mutateDomain = useCallback(
    (domain?: Domain) => {
      if (!domain) {
        void mutate();
        return;
      }

      if (!data || data.length === 0) {
        void mutate([domain]);
        return;
      }

      const exists = data.some(({ id }) => id === domain.id);

      if (exists) {
        void mutate(data.map((item) => (item.id === domain.id ? domain : item)));
        return;
      }

      // New domain added
      void mutate([...data, domain]);
    },
    [mutate, data]
  );

  const activeCustomDomains = useMemo(
    () =>
      data?.filter(({ status }) => status === DomainStatus.Active).map(({ domain }) => domain) ??
      [],
    [data]
  );

  return {
    /**
     * Legacy single custom domain.
     * - Represents the first (and historically only) custom domain returned by the API.
     * - Retained temporarily for backward compatibility while the multiple custom domains feature
     *   is being rolled out (currently only enabled for selected enterprise customers).
     * - Will be removed once multi-domain support is generally available.
     */
    data: customDomain,
    /**
     * Multiple custom domains support.
     * - Full array of custom domains returned from the API.
     * - Will eventually replace the legacy `data` field.
     */
    allDomains: data,
    isLoading,
    mutate: mutateDomain,
    activeCustomDomains,
  };
};

export default useCustomDomain;
