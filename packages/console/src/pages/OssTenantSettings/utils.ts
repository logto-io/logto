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
