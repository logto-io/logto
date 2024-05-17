import {
  type Resource,
  type CreateResource,
  getManagementApiResourceIndicator,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { type Nullable } from '@silverhand/essentials';

import { mockResource, mockScope } from '#src/__mocks__/index.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const resources = {
  findTotalNumberOfResources: async () => ({ count: 10 }),
  findAllResources: async (): Promise<Resource[]> => [mockResource],
  findResourceByIndicator: async (indicator: string): Promise<Nullable<Resource>> => {
    if (indicator === mockResource.indicator) {
      return mockResource;
    }
    return null;
  },
  findResourceById: jest.fn(async (): Promise<Resource> => mockResource),
  insertResource: async (body: CreateResource): Promise<Resource> => ({
    ...mockResource,
    ...body,
  }),
  updateResourceById: async (_: unknown, data: Partial<CreateResource>): Promise<Resource> => ({
    ...mockResource,
    ...data,
  }),
  deleteResourceById: jest.fn(),
  findScopesByResourceId: async () => [mockScope],
};
const { findResourceById } = resources;

const scopes = {
  findScopesByResourceId: async () => [mockScope],
  searchScopesByResourceId: async () => [mockScope],
  countScopesByResourceId: async () => ({ count: 1 }),
  findScopesByResourceIds: async () => [],
  insertScope: jest.fn(async () => mockScope),
  updateScopeById: jest.fn(async () => mockScope),
  deleteScopeById: jest.fn(),
  findScopeByNameAndResourceId: jest.fn(),
};
const { insertScope, updateScopeById } = scopes;

await mockIdGenerators();

const tenantContext = new MockTenant(undefined, { scopes, resources }, undefined);

const resourceScopeRoutes = await pickDefault(import('./resource.scope.js'));

describe('resource scope routes', () => {
  const resourceScopeRequest = createRequester({
    authedRoutes: resourceScopeRoutes,
    tenantContext,
  });

  it('GET /resources/:id/scopes', async () => {
    const response = await resourceScopeRequest.get('/resources/foo/scopes');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockScope]);
  });

  it('POST /resources/:id/scopes', async () => {
    const name = 'write:users';
    const description = 'description';

    const response = await resourceScopeRequest
      .post('/resources/foo/scopes')
      .send({ name, description });

    expect(response.status).toEqual(201);
    expect(findResourceById).toHaveBeenCalledWith('foo');
    expect(insertScope).toHaveBeenCalledWith({
      id: mockId,
      name,
      description,
      resourceId: 'foo',
    });
  });

  it('POST /resources/:id/scopes should throw with spaces in name', async () => {
    const name = 'write users';
    const description = 'description';

    const response = await resourceScopeRequest
      .post('/resources/foo/scopes')
      .send({ name, description });

    expect(response.status).toEqual(400);
  });

  it('POST /resources/:id/scopes should throw when the resource is management API', async () => {
    const { findResourceById } = resources;
    findResourceById.mockResolvedValueOnce({
      ...mockResource,
      indicator: getManagementApiResourceIndicator('mock'),
    });
    await expect(
      resourceScopeRequest
        .post('/resources/foo/scopes')
        .send({ name: 'name', description: 'description' })
    ).resolves.toHaveProperty('status', 400);
  });

  it('PATCH /resources/:id/scopes/:scopeId', async () => {
    const name = 'write:users';
    const description = 'description';

    const response = await resourceScopeRequest
      .patch('/resources/foo/scopes/foz')
      .send({ name, description });

    expect(response.status).toEqual(200);
    expect(findResourceById).toHaveBeenCalledWith('foo');
    expect(updateScopeById).toHaveBeenCalledWith('foz', {
      name,
      description,
    });
  });

  it('PATCH /resources/:id/scopes/:scopeId should throw when the resource is management API', async () => {
    const { findResourceById } = resources;
    findResourceById.mockResolvedValueOnce({
      ...mockResource,
      indicator: getManagementApiResourceIndicator('mock'),
    });
    await expect(
      resourceScopeRequest
        .patch('/resources/foo/scopes/foz')
        .send({ name: 'name', description: 'description' })
    ).resolves.toHaveProperty('status', 400);
  });

  it('DELETE /resources/:id/scopes/:scopeId', async () => {
    await expect(resourceScopeRequest.delete('/resources/foo/scopes/foz')).resolves.toHaveProperty(
      'status',
      204
    );
  });

  it('DELETE /resources/:id/scopes/:scopeId should throw when the resource is management API', async () => {
    const { findResourceById } = resources;
    findResourceById.mockResolvedValueOnce({
      ...mockResource,
      indicator: getManagementApiResourceIndicator('mock'),
    });
    await expect(resourceScopeRequest.delete('/resources/foo/scopes/foz')).resolves.toHaveProperty(
      'status',
      400
    );
  });
});
