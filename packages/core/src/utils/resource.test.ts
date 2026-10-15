import { mockResource, mockScope } from '#src/__mocks__/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { attachScopesToResources } from './resource.js';

describe('attachScopesToResources', () => {
  it('attaches each scope to its own resource', async () => {
    const resourceA = { ...mockResource, id: 'resource-a' };
    const resourceB = { ...mockResource, id: 'resource-b' };
    const resourceWithoutScopes = { ...mockResource, id: 'resource-c' };
    const scopeA1 = { ...mockScope, id: 'scope-a1', resourceId: resourceA.id };
    const scopeA2 = { ...mockScope, id: 'scope-a2', resourceId: resourceA.id };
    const scopeB1 = { ...mockScope, id: 'scope-b1', resourceId: resourceB.id };

    const { scopes } = new MockQueries({
      scopes: { findScopesByResourceIds: async () => [scopeA1, scopeB1, scopeA2] },
    });

    await expect(
      attachScopesToResources([resourceA, resourceB, resourceWithoutScopes], scopes)
    ).resolves.toEqual([
      { ...resourceA, scopes: [scopeA1, scopeA2] },
      { ...resourceB, scopes: [scopeB1] },
      { ...resourceWithoutScopes, scopes: [] },
    ]);
  });
});
