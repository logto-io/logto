import { type RegionResponse as RegionType } from '@logto/cloud/routes';
import { useCallback } from 'react';
import useSWRImmutable from 'swr/immutable';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';

/** Checks if a region is a development-only region based on its name. */
export const isDevOnlyRegion = (regionName?: string): boolean =>
  regionName?.includes('_DEV_') ?? false;

/**
 * Hook to fetch available regions for the current user. Cloud API is required to use this hook.
 */
const useAvailableRegions = () => {
  const cloudApi = useCloudApi();
  const { data: regions, error: regionsError } = useSWRImmutable<RegionType[], Error>(
    'api/me/regions',
    async () => {
      const { regions } = await cloudApi.get('/api/me/regions');
      return regions;
    }
  );
  const getRegionById = useCallback(
    (id: string) => regions?.find((region) => region.name === id),
    [regions]
  );

  return {
    /** Available regions for the current user. */
    regions,
    /** Error encountered while fetching regions. */
    regionsError,
    /** Function to get a region by its ID. If the region is not found, returns undefined. */
    getRegionById,
  };
};

export default useAvailableRegions;
