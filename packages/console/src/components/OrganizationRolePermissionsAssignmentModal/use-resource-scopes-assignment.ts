import { type Scope, type ResourceResponse } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';

import { defaultPageSize } from '@/consts';
import { type DataGroup } from '@/ds-components/DataTransferBox/type';
import { type RequestError } from '@/hooks/use-api';
import { buildUrl, formatSearchKeyword } from '@/utils/url';

const pageSize = defaultPageSize;

function useResourceScopesAssignment(assignedScopes?: Scope[]) {
  const [selectedData, setSelectedData] = useState<Scope[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');

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

  const availableDataGroups: Array<DataGroup<Scope>> = useMemo(() => {
    if (!allResources) {
      return [];
    }

    const lowerCasedKeyword = keyword.toLowerCase();

    const resourcesWithScopes = allResources.map(({ name, indicator, scopes, id: resourceId }) => {
      const unassignedScopes = scopes.filter(
        ({ id: scopeId }) => !assignedScopes?.some((scope) => scope.id === scopeId)
      );
      const doesResourceMatchKeyword =
        !lowerCasedKeyword ||
        name.toLowerCase().includes(lowerCasedKeyword) ||
        indicator.toLowerCase().includes(lowerCasedKeyword);

      return {
        groupId: resourceId,
        groupName: name,
        dataList: doesResourceMatchKeyword
          ? unassignedScopes
          : unassignedScopes.filter(({ name: scopeName }) =>
              scopeName.toLowerCase().includes(lowerCasedKeyword)
            ),
      };
    });

    // Filter out the resources that have no scopes
    return resourcesWithScopes.filter(({ dataList }) => dataList.length > 0);
  }, [allResources, assignedScopes, keyword]);

  return useMemo(
    () => ({
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
    }),
    [availableDataGroups, isSourceLoading, onSourceSearch, page, selectedData, totalCount]
  );
}

export default useResourceScopesAssignment;
