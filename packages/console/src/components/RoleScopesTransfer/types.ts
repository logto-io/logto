import type { ResourceResponse, ScopeResponse } from '@logto/schemas';

export type DetailedResourceResponse = Omit<ResourceResponse, 'scopes'> & {
  scopes: ScopeResponse[];
};
