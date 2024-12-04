import { UserScope } from '@logto/core-kit';
import { ApplicationUserConsentScopeType } from '@logto/schemas';
import { useState, useMemo } from 'react';

import { type ScopeAssignmentHook } from './type';

type HookType = ScopeAssignmentHook<ApplicationUserConsentScopeType.UserScopes>;
type SelectedDataType = ReturnType<HookType>['selectedData'][number];

const useUserScopesAssignment: HookType = (assignedUserScopes = []) => {
  const [selectedData, setSelectedData] = useState<SelectedDataType[]>([]);

  const availableDataList = useMemo(
    () =>
      Object.values(UserScope)
        .map((name) => ({
          name,
          id: name,
        }))
        // Filter out the scopes that have been assigned
        .filter(({ id }) => !assignedUserScopes.includes(id)),
    [assignedUserScopes]
  );

  return {
    scopeType: ApplicationUserConsentScopeType.UserScopes,
    selectedData,
    setSelectedData,
    availableDataList,
    title: 'application_details.permissions.user_permissions_assignment_form_title',
  };
};

export default useUserScopesAssignment;
