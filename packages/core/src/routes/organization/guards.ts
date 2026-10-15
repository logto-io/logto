import { Organizations } from '@logto/schemas';

export { organizationWithOrganizationRolesGuard as organizationWithRolesResponseGuard } from '@logto/schemas';

export const organizationResponseGuard = Organizations.guard;
