type OssTenantMembersAvailabilityOptions = {
  readonly isCloud: boolean;
};

type OssTenantMembersUpsellCopyOptions = {
  readonly isDevFeaturesEnabled: boolean;
};

export const shouldShowOssTenantMembersTab = ({ isCloud }: OssTenantMembersAvailabilityOptions) =>
  !isCloud;

export const getOssTenantMembersUpsellCopyKeys = ({
  isDevFeaturesEnabled,
}: OssTenantMembersUpsellCopyOptions) => {
  // DEV: self-hosted plans
  if (isDevFeaturesEnabled) {
    return {
      title: 'tenants.members.self_hosted_card_title' as const,
      description: 'tenants.members.self_hosted_card_description' as const,
      action: 'tenants.members.self_hosted_card_action' as const,
    };
  }

  return {
    title: 'tenants.members.card_title' as const,
    description: 'tenants.members.card_description' as const,
    action: 'tenants.members.card_action' as const,
  };
};
