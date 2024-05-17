import { type Scope, type OrganizationScope } from '@logto/schemas';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

/**
 * Fetches the organization and resource scopes of an organization role.
 */
function useOrganizationRoleScopes(organizationRoleId: string) {
  const organizationRolePath = `api/organization-roles/${organizationRoleId}`;

  const {
    data: organizationScopes = [],
    error: fetchOrganizationScopesError,
    isLoading: isOrganizationScopesLoading,
    mutate: mutateOrganizationScopes,
  } = useSWR<OrganizationScope[], RequestError>(`${organizationRolePath}/scopes`);

  const {
    data: resourceScopes = [],
    error: fetchResourceScopesError,
    isLoading: isResourceScopesLoading,
    mutate: mutateResourceScopes,
  } = useSWR<Scope[], RequestError>(`${organizationRolePath}/resource-scopes`);

  return {
    organizationScopes,
    resourceScopes,
    error: fetchOrganizationScopesError ?? fetchResourceScopesError,
    isLoading: isOrganizationScopesLoading || isResourceScopesLoading,
    mutate: () => {
      void mutateOrganizationScopes();
      void mutateResourceScopes();
    },
  };
}

export default useOrganizationRoleScopes;
