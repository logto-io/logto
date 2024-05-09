import {
  type ResourceResponse,
  ApplicationUserConsentScopeType,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';
import { isManagementApi } from '@logto/schemas';
import { useState, useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';
import { buildUrl } from '@/utils/url';

import { type ScopeAssignmentHook } from './type';

type HookType = ScopeAssignmentHook<
  | ApplicationUserConsentScopeType.ResourceScopes
  | ApplicationUserConsentScopeType.OrganizationResourceScopes,
  ApplicationUserConsentScopesResponse['resourceScopes'][number]['scopes'][number],
  {
    /** Whether the assignment is for an organization */
    isForOrganization?: boolean;
  }
>;

type SelectedDataType = ReturnType<HookType>['selectedData'][number];

const useResourceScopesAssignment: HookType = (assignedResourceScopes, options) => {
  const [selectedData, setSelectedData] = useState<SelectedDataType[]>([]);
  const { isForOrganization } = options ?? {};

  const { data: allResources } = useSWR<ResourceResponse[], RequestError>(
    buildUrl('api/resources', {
      includeScopes: String(true),
    })
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
    scopeType: isForOrganization
      ? ApplicationUserConsentScopeType.OrganizationResourceScopes
      : ApplicationUserConsentScopeType.ResourceScopes,
    selectedData,
    setSelectedData,
    availableDataGroups,
    title: `application_details.permissions.${
      isForOrganization
        ? 'add_permissions_for_organization'
        : 'api_resource_permissions_assignment_form_title'
    }`,
  };
};

export default useResourceScopesAssignment;
