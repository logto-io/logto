import { type ResourceResponse, ApplicationUserConsentScopeType } from '@logto/schemas';
import { isManagementApi } from '@logto/schemas';
import { useState, useMemo } from 'react';
import useSWR from 'swr';

import {
  type SelectedScopeAssignmentScopeDataType,
  type ScopeAssignmentResourceScopesGroupDataType,
} from '@/components/ScopesAssignmentModal/type';
import { type RequestError } from '@/hooks/use-api';

import { type ScopeAssignmentHook } from './type';

const useResourceScopesAssignment: ScopeAssignmentHook<
  ApplicationUserConsentScopeType.ResourceScopes
> = (assignedResourceScopes) => {
  const [selectedScopes, setSelectedScopes] = useState<SelectedScopeAssignmentScopeDataType[]>([]);

  const { data: allResources } = useSWR<ResourceResponse[], RequestError>(
    'api/resources?includeScopes=true'
  );

  const availableScopes = useMemo(() => {
    if (!allResources) {
      return [];
    }

    const resourcesWithScopes: ScopeAssignmentResourceScopesGroupDataType[] = allResources
      // Filter out the management APIs
      .filter((resource) => !isManagementApi(resource.indicator))
      .map(({ name, scopes, id }) => {
        const assignedResource = assignedResourceScopes?.find(({ resource }) => resource.id === id);

        return {
          resourceId: id,
          resourceName: name,
          scopes: scopes
            // Filter out the scopes that have been assigned
            .filter(({ id: scopeId }) => {
              if (!assignedResourceScopes) {
                return true;
              }

              return assignedResource
                ? !assignedResource.scopes.some((scope) => scope.id === scopeId)
                : true;
            })
            .map(({ id, name }) => ({
              id,
              name,
            })),
        };
      });

    // Filter out the resources that have no scopes
    return resourcesWithScopes.filter(({ scopes }) => scopes.length > 0);
  }, [allResources, assignedResourceScopes]);

  return {
    scopeType: ApplicationUserConsentScopeType.ResourceScopes,
    selectedScopes,
    setSelectedScopes,
    groupedAvailableResourceScopes: availableScopes,
  };
};

export default useResourceScopesAssignment;
