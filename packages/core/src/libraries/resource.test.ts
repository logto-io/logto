import { mockResource, mockResource2, mockResource3, mockScope } from '#src/__mocks__/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const findScopesByResourceIds = jest.fn(async () => [
  { ...mockScope, id: '1', resourceId: mockResource.id },
  { ...mockScope, id: '2', resourceId: mockResource.id },
  { ...mockScope, id: '3', resourceId: mockResource2.id },
]);

const { createResourceLibrary } = await import('./resource.js');

const { attachScopesToResources } = createResourceLibrary(
  new MockQueries({ scopes: { findScopesByResourceIds } })
);

describe('attachScopesToResources', () => {
  beforeEach(() => {
    findScopesByResourceIds.mockClear();
  });

  it('should find and attach scopes to each resource', async () => {
    await expect(
      attachScopesToResources([mockResource, mockResource2, mockResource3])
    ).resolves.toEqual([
      {
        ...mockResource,
        scopes: [
          { ...mockScope, id: '1', resourceId: mockResource.id },
          { ...mockScope, id: '2', resourceId: mockResource.id },
        ],
      },
      {
        ...mockResource2,
        scopes: [{ ...mockScope, id: '3', resourceId: mockResource2.id }],
      },
      {
        ...mockResource3,
        scopes: [],
      },
    ]);
  });
});
