type OssTenantSettingsAvailabilityOptions = {
  readonly isCloud: boolean;
};

/**
 * Whether the Settings tab, which holds the Console MFA requirement, is part of the OSS tenant
 * settings. It is available to every self-hosted deployment in this fork, without a license.
 */
export const shouldShowOssTenantSettingsTab = ({ isCloud }: OssTenantSettingsAvailabilityOptions) =>
  !isCloud;
