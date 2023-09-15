import { DomainStatus, type Domain } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import { customDomainSyncInterval } from '@/consts/custom-domain';
import { isCloud } from '@/consts/env';
import { isAbsoluteUrl } from '@/utils/url';

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
      void mutate(domain ? [domain] : undefined);
    },
    [mutate]
  );

  const applyDomain = useCallback(
    (url: string) => {
      if (customDomain?.status !== DomainStatus.Active || !isAbsoluteUrl(url)) {
        return url;
      }
      return url.replace(new URL(url).host, customDomain.domain);
    },
    [customDomain]
  );

  return {
    data: customDomain,
    isLoading,
    mutate: mutateDomain,
    applyDomain,
  };
};

export default useCustomDomain;
