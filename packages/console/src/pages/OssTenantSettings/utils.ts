type OssTenantMembersAvailabilityOptions = {
  readonly isCloud: boolean;
  readonly isDevFeaturesEnabled: boolean;
};

export const shouldShowOssTenantMembersTab = ({
  isCloud,
  isDevFeaturesEnabled,
}: OssTenantMembersAvailabilityOptions) => !isCloud && isDevFeaturesEnabled;

export const getOssTenantMembersUpsellCopyKeys = () => ({
  title: 'tenants.members.card_title' as const,
  description: 'tenants.members.card_description' as const,
  action: 'tenants.members.card_action' as const,
});
