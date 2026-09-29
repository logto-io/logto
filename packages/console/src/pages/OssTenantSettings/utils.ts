type OssTenantMembersAvailabilityOptions = {
  readonly isCloud: boolean;
};

export const shouldShowOssTenantMembersTab = ({ isCloud }: OssTenantMembersAvailabilityOptions) =>
  !isCloud;

export const getOssTenantMembersUpsellCopyKeys = () => ({
  title: 'tenants.members.self_hosted_card_title' as const,
  description: 'tenants.members.self_hosted_card_description' as const,
  action: 'tenants.members.self_hosted_card_action' as const,
});

type OssTenantLicenseAvailabilityOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
};

/**
 * Whether the License tab is part of the OSS tenant settings.
 *
 * A license is the entitlement source of a self-hosted deployment only: on Cloud the subscription
 * is, and `PUT /api/systems/license` answers 501 there, so there is nothing to install.
 */
export const shouldShowOssTenantLicenseTab = ({
  isCloud,
  // Self-hosted plans: the license page ships with the unlaunched self-hosted Pro and Enterprise
  // plans. Removed together with the other self-hosted plans guards at launch.
  isDevFeaturesEnabled,
}: OssTenantLicenseAvailabilityOptions) => !isCloud && isDevFeaturesEnabled;

type OssTenantSettingsAvailabilityOptions = OssTenantLicenseAvailabilityOptions & {
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
  // Self-hosted plans: mandatory Console MFA ships with the unlaunched self-hosted Pro and
  // Enterprise plans. Removed together with the other self-hosted plans guards at launch.
  isDevFeaturesEnabled,
  isMandatoryMfaEntitled,
  isMfaRequired,
}: OssTenantSettingsAvailabilityOptions) =>
  !isCloud && isDevFeaturesEnabled && (isMandatoryMfaEntitled || isMfaRequired);

type OssTenantMembersPageOptions = OssTenantLicenseAvailabilityOptions & {
  /** Whether the installed license grants Console collaboration. */
  readonly isConsoleCollaborationEntitled: boolean;
};

/**
 * Whether the Members tab shows the members and invitations, rather than the self-hosted plans
 * upsell. It follows the license entitlement: without it there is a single Console user, and
 * nothing to manage.
 */
export const shouldShowOssTenantMembersPage = ({
  isCloud,
  // Self-hosted plans: Console members and invitations ship with the unlaunched self-hosted Pro
  // and Enterprise plans. Removed together with the other self-hosted plans guards at launch.
  isDevFeaturesEnabled,
  isConsoleCollaborationEntitled,
}: OssTenantMembersPageOptions) =>
  !isCloud && isDevFeaturesEnabled && isConsoleCollaborationEntitled;
