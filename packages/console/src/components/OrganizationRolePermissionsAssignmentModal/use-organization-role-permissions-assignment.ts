import { cond } from '@silverhand/essentials';
import { useCallback, useMemo, useState } from 'react';

import useApi from '@/hooks/use-api';
import useOrganizationRoleScopes from '@/pages/OrganizationRoleDetails/Permissions/use-organization-role-scopes';

import { PermissionType } from './types';
import useOrganizationScopesAssignment from './use-organization-scopes-assignment';
import useResourceScopesAssignment from './use-resource-scopes-assignment';

function useOrganizationRolePermissionsAssignment(organizationRoleId: string) {
  const organizationRolePath = `api/organization-roles/${organizationRoleId}`;
  const [activeTab, setActiveTab] = useState<PermissionType>(PermissionType.Organization);
  const [isLoading, setIsLoading] = useState(false);
  const api = useApi();

  const { organizationScopes, resourceScopes, mutate } =
    useOrganizationRoleScopes(organizationRoleId);

  const organizationScopesAssignment = useOrganizationScopesAssignment(organizationScopes);
  const resourceScopesAssignment = useResourceScopesAssignment(resourceScopes);

  const clearSelectedData = useCallback(() => {
    organizationScopesAssignment.setSelectedData([]);
    resourceScopesAssignment.setSelectedData([]);
  }, [organizationScopesAssignment, resourceScopesAssignment]);

  const onSubmit = useCallback(async () => {
    setIsLoading(true);
    const newOrganizationScopes = organizationScopesAssignment.selectedData.map(({ id }) => id);
    const newResourceScopes = resourceScopesAssignment.selectedData.map(({ id }) => id);

    await Promise.all(
      [
        cond(
          newOrganizationScopes.length > 0 &&
            api.post(`${organizationRolePath}/scopes`, {
              json: { organizationScopeIds: newOrganizationScopes },
            })
        ),
        cond(
          newResourceScopes.length > 0 &&
            api.post(`${organizationRolePath}/resource-scopes`, {
              json: { scopeIds: newResourceScopes },
            })
        ),
      ].filter(Boolean)
    ).finally(() => {
      setIsLoading(false);
    });

    mutate();
  }, [
    api,
    mutate,
    organizationRolePath,
    organizationScopesAssignment.selectedData,
    resourceScopesAssignment.selectedData,
  ]);

  return useMemo(
    () => ({
      activeTab,
      setActiveTab,
      isLoading,
      organizationScopesAssignment,
      resourceScopesAssignment,
      clearSelectedData,
      onSubmit,
    }),
    [
      activeTab,
      clearSelectedData,
      isLoading,
      onSubmit,
      organizationScopesAssignment,
      resourceScopesAssignment,
    ]
  );
}

export default useOrganizationRolePermissionsAssignment;
