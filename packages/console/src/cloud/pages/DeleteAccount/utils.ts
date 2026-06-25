import { getTenantIdFromOrganizationId } from '@logto/schemas';

type RoleMap = { [key in string]?: string[] };

/**
 * Given a list of organization roles from the user's claims, returns a tenant ID - role names map.
 * A user may have multiple roles in the same tenant.
 */
export const getRoleMap = (organizationRoles: string[]) =>
  organizationRoles.reduce<RoleMap>((accumulator, value) => {
    const [organizationId, roleName] = value.split(':');

    if (!organizationId || !roleName) {
      return accumulator;
    }

    const tenantId = getTenantIdFromOrganizationId(organizationId);

    if (!tenantId) {
      return accumulator;
    }

    return {
      ...accumulator,
      [tenantId]: [...(accumulator[tenantId] ?? []), roleName],
    };
  }, {});
