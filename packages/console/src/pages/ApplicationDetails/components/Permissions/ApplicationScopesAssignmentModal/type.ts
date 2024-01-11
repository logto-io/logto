import {
  type ApplicationUserConsentScopesResponse,
  type ApplicationUserConsentScopeType,
} from '@logto/schemas';

import {
  type ScopeAssignmentScopeDataType,
  type ScopeAssignmentResourceScopesGroupDataType,
  type SelectedScopeAssignmentScopeDataType,
} from '@/components/ScopesAssignmentModal/type';

type ScopeAssignmentHookReturnType<T extends ApplicationUserConsentScopeType> = {
  scopeType: T;
  selectedScopes: SelectedScopeAssignmentScopeDataType[];
  setSelectedScopes: (selectedScopes: SelectedScopeAssignmentScopeDataType[]) => void;
  availableScopes?: ScopeAssignmentScopeDataType[];
  groupedAvailableResourceScopes?: ScopeAssignmentResourceScopesGroupDataType[];
};

// This is used to parse the ApplicationUserConsentScopeType to the response key
type CamelCase<T> = T extends `${infer A}-${infer B}` ? `${A}${Capitalize<CamelCase<B>>}` : T;
export type ScopeAssignmentHook<T extends ApplicationUserConsentScopeType> = (
  assignedScopes?: ApplicationUserConsentScopesResponse[CamelCase<T>]
) => ScopeAssignmentHookReturnType<T>;
