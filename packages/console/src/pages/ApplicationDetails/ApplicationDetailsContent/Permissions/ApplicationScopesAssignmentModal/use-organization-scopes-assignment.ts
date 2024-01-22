import {
  ApplicationUserConsentScopeType,
  type OrganizationScope,
  type ApplicationUserConsentScopesResponse,
} from '@logto/schemas';
import { useState, useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

import { type ScopeAssignmentHook } from './type';

type HookType = ScopeAssignmentHook<
  ApplicationUserConsentScopeType.OrganizationScopes,
  ApplicationUserConsentScopesResponse['organizationScopes'][number]
>;

type SelectedDataType = ReturnType<HookType>['selectedData'][number];

const useOrganizationScopesAssignment: HookType = (assignedOrganizationScopes = []) => {
  const [selectedData, setSelectedData] = useState<SelectedDataType[]>([]);

  const { data: organizationScopes } = useSWR<OrganizationScope[], RequestError>(
    'api/organization-scopes'
  );

  const availableDataList = useMemo(
    () =>
      (organizationScopes ?? []).filter(
        ({ id }) => !assignedOrganizationScopes.some((scope) => scope.id === id)
      ),
    [organizationScopes, assignedOrganizationScopes]
  );

  return {
    scopeType: ApplicationUserConsentScopeType.OrganizationScopes,
    selectedData,
    setSelectedData,
    availableDataList,
    title: 'application_details.permissions.organization_permissions_assignment_form_title',
  };
};

export default useOrganizationScopesAssignment;
