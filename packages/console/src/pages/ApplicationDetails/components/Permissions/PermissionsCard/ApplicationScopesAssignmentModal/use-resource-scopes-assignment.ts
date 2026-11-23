import {
  type ResourceResponse,
  ApplicationUserConsentScopeType,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useState, useMemo } from 'react';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import { type RequestError } from '@/hooks/use-api';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

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

const pageSize = defaultPageSize;

const useResourceScopesAssignment: HookType = (assignedResourceScopes, options) => {
  const [selectedData, setSelectedData] = useState<SelectedDataType[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const { isForOrganization } = options ?? {};

  const { data, error } = useSWR<[ResourceResponse[], number], RequestError>(
    buildUrl('api/resources', {
      page: String(page),
      page_size: String(pageSize),
      includeScopes: String(true),
      excludeManagementApis: String(true),
      hasScopes: String(true),
      ...conditional(keyword && { search: formatSearchKeyword(keyword) }),
    }),
    { keepPreviousData: false }
  );

  const isSourceLoading = !data && !error;
  const [allResources, totalCount] = data ?? [];

  const onSourceSearch = useCallback((value: string) => {
    setPage(1);
    setKeyword(value);
  }, []);

  const availableDataGroups = useMemo(() => {
    if (!allResources) {
      return [];
    }

    const lowerCasedKeyword = keyword.toLowerCase();

    const resourcesWithScopes: ReturnType<HookType>['availableDataGroups'] = allResources.map(
      ({ name, indicator, scopes, id }) => {
        const assignedResource = assignedResourceScopes?.find(({ resource }) => resource.id === id);
        const unassignedScopes = scopes.filter(({ id: scopeId }) => {
          if (!assignedResourceScopes) {
            return true;
          }

          return assignedResource
            ? !assignedResource.scopes.some((scope) => scope.id === scopeId)
            : true;
        });

        const doesResourceMatchKeyword =
          !lowerCasedKeyword ||
          name.toLowerCase().includes(lowerCasedKeyword) ||
          indicator.toLowerCase().includes(lowerCasedKeyword);

        return {
          groupId: id,
          groupName: name,
          dataList: doesResourceMatchKeyword
            ? unassignedScopes
            : unassignedScopes.filter(({ name: scopeName }) =>
                scopeName.toLowerCase().includes(lowerCasedKeyword)
              ),
        };
      }
    );

    // Filter out the resources that have no scopes
    return resourcesWithScopes.filter(({ dataList }) => dataList.length > 0);
  }, [allResources, assignedResourceScopes, keyword]);

  return {
    scopeType: isForOrganization
      ? ApplicationUserConsentScopeType.OrganizationResourceScopes
      : ApplicationUserConsentScopeType.ResourceScopes,
    selectedData,
    setSelectedData,
    availableDataGroups,
    isSourceLoading,
    sourcePagination: {
      page,
      pageSize,
      totalCount,
      onChange: setPage,
    },
    onSourceSearch,
    title: `application_details.permissions.api_resource_permissions_assignment_form_title`,
  };
};

export default useResourceScopesAssignment;
