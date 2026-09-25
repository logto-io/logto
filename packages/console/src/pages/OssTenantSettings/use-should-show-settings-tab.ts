import { useContext } from 'react';

import { isDevFeaturesEnabled } from '@/consts/env';
import { SubscriptionDataContext } from '@/contexts/SubscriptionDataProvider';
import useOssTenantMfa from '@/hooks/use-oss-tenant-mfa';

import { shouldShowOssTenantSettingsTab } from './utils';

/** Whether the Settings tab is part of the OSS tenant settings. See the util it wraps. */
const useShouldShowOssTenantSettingsTab = () => {
  const { license } = useContext(SubscriptionDataContext);
  const { data } = useOssTenantMfa();

  return shouldShowOssTenantSettingsTab({
    isCloud: false,
    isDevFeaturesEnabled,
    isMandatoryMfaEntitled: Boolean(license?.quota.mandatoryMfa),
    isMfaRequired: Boolean(data?.isMfaRequired),
  });
};

export default useShouldShowOssTenantSettingsTab;
