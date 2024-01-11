import { ApplicationUserConsentScopeType, type OrganizationScope } from '@logto/schemas';
import { useState, useMemo } from 'react';
import useSWR from 'swr';

import { type SelectedScopeAssignmentScopeDataType } from '@/components/ScopesAssignmentModal/type';
import { type RequestError } from '@/hooks/use-api';

import { type ScopeAssignmentHook } from './type';

const useOrganizationScopesAssignment: ScopeAssignmentHook<
  ApplicationUserConsentScopeType.OrganizationScopes
> = (assignedOrganizationScopes = []) => {
  const [selectedScopes, setSelectedScopes] = useState<SelectedScopeAssignmentScopeDataType[]>([]);

  const { data: organizationScopes } = useSWR<OrganizationScope[], RequestError>(
    'api/organization-scopes'
  );

  const availableScopes = useMemo(
    () =>
      (organizationScopes ?? [])
        .map(({ id, name }) => ({ id, name }))
        .filter(({ id }) => !assignedOrganizationScopes.some((scope) => scope.id === id)),
    [organizationScopes, assignedOrganizationScopes]
  );

  return {
    scopeType: ApplicationUserConsentScopeType.OrganizationScopes,
    selectedScopes,
    setSelectedScopes,
    availableScopes,
  };
};

export default useOrganizationScopesAssignment;
