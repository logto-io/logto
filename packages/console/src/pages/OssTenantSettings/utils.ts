type OssTenantMembersAvailabilityOptions = {
  readonly isCloud: boolean;
};

export const shouldShowOssTenantMembersTab = ({ isCloud }: OssTenantMembersAvailabilityOptions) =>
  !isCloud;

export const getOssTenantMembersUpsellCopyKeys = () => ({
  title: 'tenants.members.card_title' as const,
  description: 'tenants.members.card_description' as const,
  action: 'tenants.members.card_action' as const,
});
