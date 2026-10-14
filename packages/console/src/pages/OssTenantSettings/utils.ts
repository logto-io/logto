type OssTenantSettingsAvailabilityOptions = {
  readonly isCloud: boolean;
  /** Whether the installed license grants mandatory Console MFA. */
  readonly isMandatoryMfaEntitled: boolean;
  /** Whether Console MFA is currently required. */
  readonly isMfaRequired: boolean;
};

/**
 * Whether the Settings tab, which holds the Console MFA requirement, is part of the OSS tenant
 * settings.
 *
 * It follows the license entitlement, and stays while the requirement is on so a lapsed license
 * never leaves it on with no way to turn it off.
 */
export const shouldShowOssTenantSettingsTab = ({
  isCloud,
  isMandatoryMfaEntitled,
  isMfaRequired,
}: OssTenantSettingsAvailabilityOptions) => !isCloud && (isMandatoryMfaEntitled || isMfaRequired);
