import { type Domain } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
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
  const customDomain = conditional(!isLoading && data)?.[0];

  return {
    data: customDomain,
    isLoading,
    mutate: (domain?: Domain) => {
      if (domain) {
        void mutate([domain]);
        return;
      }
      void mutate();
    },
  };
};

export default useCustomDomain;
