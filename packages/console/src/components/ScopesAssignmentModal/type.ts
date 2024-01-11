export type ScopeAssignmentScopeDataType = {
  id: string;
  name: string;
};

export type ScopeAssignmentResourceScopesGroupDataType = {
  resourceId: string;
  resourceName: string;
  scopes: ScopeAssignmentScopeDataType[];
};

export type SelectedScopeAssignmentScopeDataType = ScopeAssignmentScopeDataType & {
  resourceName?: string;
};
