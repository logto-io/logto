import { type OrganizationRole } from '@logto/schemas';

export type OrganizationRoleDetailsOutletContext = {
  organizationRole: OrganizationRole;
  isDeleting: boolean;
  onOrganizationRoleUpdated: (organizationRole: OrganizationRole) => void;
};
