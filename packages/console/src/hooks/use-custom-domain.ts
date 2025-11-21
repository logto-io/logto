import { DomainStatus, type Domain } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useContext, useMemo } from 'react';
import useSWR from 'swr';

import { customDomainSyncInterval } from '@/consts/custom-domain';
import { isCloud } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import { TenantsContext } from '@/contexts/TenantsProvider';

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

  const { currentSubscriptionBasicQuota, currentSubscriptionUsage } =
    useContext(SubscriptionDataContext);

  const { currentTenant } = useContext(TenantsContext);

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

      // New domain added - insert at the beginning to maintain sort order (newest first)
      void mutate([domain, ...data]);
    },
    [mutate, data]
  );

  /**
   * Note: Sorted by creation time (newest first).
   * Newly created domains will appear at the top of the list.
   */
  const allDomains = useMemo(() => {
    if (!data) {
      return [];
    }
    return data.slice().sort((domainA, domainB) => domainB.createdAt - domainA.createdAt);
  }, [data]);

  const activeCustomDomains = useMemo(
    () =>
      allDomains.filter(({ status }) => status === DomainStatus.Active).map(({ domain }) => domain),
    [allDomains]
  );

  /**
   * Whether to display the feature add-on tag for custom domains.
   * Shows the add-on tag when current usage exceeds the basic quota limit (excluding add-on quota).
   */
  const shouldDisplayFeatureAddOnTag = useMemo(() => {
    /**
     * Specifically for private region users who have enabled multiple custom domains feature flag.
     *
     * TODO @xiaoyijun: remove this special handling after enterprise subscription is live
     */
    if (currentTenant?.featureFlags?.isMultipleCustomDomainsEnabled) {
      return false;
    }

    return (
      currentSubscriptionUsage.customDomainsLimit >=
      (currentSubscriptionBasicQuota.customDomainsLimit ?? Number.POSITIVE_INFINITY)
    );
  }, [
    currentSubscriptionBasicQuota.customDomainsLimit,
    currentSubscriptionUsage.customDomainsLimit,
    currentTenant?.featureFlags?.isMultipleCustomDomainsEnabled,
  ]);

  const shouldDisplayUpsellNotification = useMemo(() => {
    /**
     * Specifically for private region users who have enabled multiple custom domains feature flag.
     *
     * TODO @xiaoyijun: remove this special handling after enterprise subscription is live
     */
    if (currentTenant?.featureFlags?.isMultipleCustomDomainsEnabled) {
      return false;
    }

    return (
      currentSubscriptionBasicQuota.customDomainsLimit ===
      currentSubscriptionUsage.customDomainsLimit
    );
  }, [
    currentSubscriptionBasicQuota.customDomainsLimit,
    currentSubscriptionUsage.customDomainsLimit,
    currentTenant?.featureFlags?.isMultipleCustomDomainsEnabled,
  ]);

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
    allDomains,
    isLoading,
    mutate: mutateDomain,
    activeCustomDomains,
    shouldDisplayFeatureAddOnTag,
    shouldDisplayUpsellNotification,
  };
};

export default useCustomDomain;
