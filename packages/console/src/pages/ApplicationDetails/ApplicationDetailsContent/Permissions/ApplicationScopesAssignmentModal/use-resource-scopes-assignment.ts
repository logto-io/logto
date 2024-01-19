import {
  type ResourceResponse,
  ApplicationUserConsentScopeType,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';
import { isManagementApi } from '@logto/schemas';
import { useState, useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

import { type ScopeAssignmentHook } from './type';

type HookType = ScopeAssignmentHook<
  ApplicationUserConsentScopeType.ResourceScopes,
  ApplicationUserConsentScopesResponse['resourceScopes'][number]['scopes'][number]
>;

type SelectedDataType = ReturnType<HookType>['selectedData'][number];

const useResourceScopesAssignment: HookType = (assignedResourceScopes) => {
  const [selectedData, setSelectedData] = useState<SelectedDataType[]>([]);

  const { data: allResources } = useSWR<ResourceResponse[], RequestError>(
    'api/resources?includeScopes=true'
  );

  const availableDataGroups = useMemo(() => {
    if (!allResources) {
      return [];
    }

    const resourcesWithScopes: ReturnType<HookType>['availableDataGroups'] = allResources
      // Filter out the management APIs
      .filter((resource) => !isManagementApi(resource.indicator))
      .map(({ name, scopes, id }) => {
        const assignedResource = assignedResourceScopes?.find(({ resource }) => resource.id === id);

        return {
          groupId: id,
          groupName: name,
          dataList: scopes
            // Filter out the scopes that have been assigned
            .filter(({ id: scopeId }) => {
              if (!assignedResourceScopes) {
                return true;
              }

              return assignedResource
                ? !assignedResource.scopes.some((scope) => scope.id === scopeId)
                : true;
            }),
        };
      });

    // Filter out the resources that have no scopes
    return resourcesWithScopes.filter(({ dataList }) => dataList.length > 0);
  }, [allResources, assignedResourceScopes]);

  return {
    scopeType: ApplicationUserConsentScopeType.ResourceScopes,
    selectedData,
    setSelectedData,
    availableDataGroups,
    title: 'application_details.permissions.api_resource_permissions_assignment_form_title',
  };
};

export default useResourceScopesAssignment;
