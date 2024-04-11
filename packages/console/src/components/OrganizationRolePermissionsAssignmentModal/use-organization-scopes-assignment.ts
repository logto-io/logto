import { type OrganizationScope } from '@logto/schemas';
import { useMemo, useState } from 'react';
import useSWR from 'swr';

function useOrganizationScopesAssignment(assignedScopes: OrganizationScope[] = []) {
  const [selectedData, setSelectedData] = useState<OrganizationScope[]>([]);

  const { data: organizationScopes } = useSWR<OrganizationScope[]>('api/organization-scopes');

  const availableDataList = useMemo(
    () =>
      (organizationScopes ?? []).filter(
        ({ id }) => !assignedScopes.some((scope) => scope.id === id)
      ),
    [organizationScopes, assignedScopes]
  );

  return useMemo(
    () => ({
      selectedData,
      setSelectedData,
      availableDataList,
    }),
    [selectedData, setSelectedData, availableDataList]
  );
}

export default useOrganizationScopesAssignment;
