import { UserScope } from '@logto/core-kit';
import { ApplicationUserConsentScopeType } from '@logto/schemas';
import { useState, useMemo } from 'react';

import { type SelectedScopeAssignmentScopeDataType } from '@/components/ScopesAssignmentModal/type';

import { type ScopeAssignmentHook } from './type';

const useUserScopesAssignment: ScopeAssignmentHook<ApplicationUserConsentScopeType.UserScopes> = (
  assignedUserScopes = []
) => {
  const [selectedScopes, setSelectedScopes] = useState<SelectedScopeAssignmentScopeDataType[]>([]);

  const availableScopes = useMemo(
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
    selectedScopes,
    setSelectedScopes,
    availableScopes,
  };
};

export default useUserScopesAssignment;
