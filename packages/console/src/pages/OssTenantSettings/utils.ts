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
