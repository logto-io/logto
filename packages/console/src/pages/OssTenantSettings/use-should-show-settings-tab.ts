import { shouldShowOssTenantSettingsTab } from './utils';

/** Whether the Settings tab is part of the OSS tenant settings. See the util it wraps. */
const useShouldShowOssTenantSettingsTab = () => shouldShowOssTenantSettingsTab({ isCloud: false });

export default useShouldShowOssTenantSettingsTab;
