import { isValidCustomTenantId } from '@logto/core-kit';
import { condArray } from '@silverhand/essentials';

import { type RegionResponse as RegionType } from '@/cloud/types/router';
import { publicInstancesDropdownItem, type InstanceDropdownItemProps } from '@/components/Region';

/**
 * Validate the full custom tenant ID (prefix + suffix).
 *
 * @param value - The suffix value to validate
 * @param prefix - The prefix that will be prepended to the suffix
 * @returns `true` if valid, `false` otherwise
 */
export const validateCustomTenantId = (value: string | undefined, prefix: string): boolean => {
  if (!value) {
    return true;
  }

  return isValidCustomTenantId(`${prefix}${value}`);
};

export const checkPrivateRegionAccess = (regions: RegionType[]): boolean => {
  return regions.some(({ isPrivate }) => isPrivate);
};

export const getInstanceDropdownItems = (regions: RegionType[]): InstanceDropdownItemProps[] => {
  const hasPublicRegions = regions.some(({ isPrivate }) => !isPrivate);
  const privateInstances = regions
    .filter(({ isPrivate }) => isPrivate)
    .map(({ id, name, country, tags, displayName }) => ({ id, name, country, tags, displayName }));

  return condArray(hasPublicRegions && publicInstancesDropdownItem, ...privateInstances);
};
