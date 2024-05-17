import { isManagementApi, type Scope, type ResourceResponse } from '@logto/schemas';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

import { type DataGroup } from '@/ds-components/DataTransferBox/type';

function useResourceScopesAssignment(assignedScopes?: Scope[]) {
  const [selectedData, setSelectedData] = useState<Scope[]>([]);

  const { data: allResources } = useSWR<ResourceResponse[]>('api/resources?includeScopes=true');

  const availableDataGroups: Array<DataGroup<Scope>> = useMemo(() => {
    if (!allResources) {
      return [];
    }

    const resourcesWithScopes = allResources
      // Filter out the management APIs
      .filter((resource) => !isManagementApi(resource.indicator))
      .map(({ name, scopes, id: resourceId }) => ({
        groupId: resourceId,
        groupName: name,
        dataList: scopes
          // Filter out the scopes that have been assigned
          .filter(({ id: scopeId }) => !assignedScopes?.some((scope) => scope.id === scopeId)),
      }));

    // Filter out the resources that have no scopes
    return resourcesWithScopes.filter(({ dataList }) => dataList.length > 0);
  }, [allResources, assignedScopes]);

  return useMemo(
    () => ({
      selectedData,
      setSelectedData,
      availableDataGroups,
    }),
    [availableDataGroups, selectedData]
  );
}

export default useResourceScopesAssignment;
