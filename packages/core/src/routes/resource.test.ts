import type { Resource, CreateResource } from '@logto/schemas';
import { pickDefault, createMockUtils } from '@logto/shared/esm';

import { mockResource, mockScope } from '#src/__mocks__/index.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('#src/libraries/resource.js', () => ({
  attachScopesToResources: async (resources: Resource[]) =>
    resources.map((resource) => ({
      ...resource,
      scopes: [],
    })),
}));

const { findResourceById } = mockEsm('#src/queries/resource.js', () => ({
  findTotalNumberOfResources: async () => ({ count: 10 }),
  findAllResources: async (): Promise<Resource[]> => [mockResource],
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
}));

const { insertScope, updateScopeById } = mockEsm('#src/queries/scope.js', () => ({
  findScopesByResourceId: async () => [mockScope],
  insertScope: jest.fn(async () => mockScope),
  findScopeById: jest.fn(),
  updateScopeById: jest.fn(async () => mockScope),
  deleteScopeById: jest.fn(),
}));

mockEsm('@logto/core-kit', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: () => () => 'randomId',
}));

const resourceRoutes = await pickDefault(import('./resource.js'));

describe('resource routes', () => {
  const resourceRequest = createRequester({ authedRoutes: resourceRoutes });

  it('GET /resources', async () => {
    const response = await resourceRequest.get('/resources');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockResource]);
    expect(response.header).toHaveProperty('total-number', '10');
  });

  it('GET /resources?includeScopes=true', async () => {
    const response = await resourceRequest.get('/resources?includeScopes=true');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([{ ...mockResource, scopes: [] }]);
    expect(response.header).toHaveProperty('total-number', '10');
  });

  it('POST /resources', async () => {
    const name = 'user api';
    const indicator = 'logto.dev/user';
    const accessTokenTtl = 60;

    const response = await resourceRequest
      .post('/resources')
      .send({ name, indicator, accessTokenTtl });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      id: 'randomId',
      name,
      indicator,
      accessTokenTtl,
      scopes: [],
    });
  });

  it('POST /resources should throw with invalid input body', async () => {
    const name = 'user api';
    const indicator = 'logto.dev/user';

    await expect(resourceRequest.post('/resources')).resolves.toHaveProperty('status', 400);
    await expect(resourceRequest.post('/resources').send({ name })).resolves.toHaveProperty(
      'status',
      400
    );
    await expect(resourceRequest.post('/resources').send({ indicator })).resolves.toHaveProperty(
      'status',
      400
    );
  });

  it('GET /resources/:id', async () => {
    const response = await resourceRequest.get('/resources/foo');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockResource,
    });
  });

  it('PATCH /resources/:id', async () => {
    const name = 'user api';
    const indicator = 'logto.dev/user';
    const accessTokenTtl = 60;

    const response = await resourceRequest
      .patch('/resources/foo')
      .send({ name, indicator, accessTokenTtl });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockResource,
      name,
      indicator,
      accessTokenTtl,
    });
  });

  it('PATCH /resources/:id should throw with invalid propreties', async () => {
    const response = await resourceRequest.patch('/resources/foo').send({ indicator: 12 });
    expect(response.status).toEqual(400);
  });

  it('DELETE /resources/:id', async () => {
    await expect(resourceRequest.delete('/resources/foo')).resolves.toHaveProperty('status', 204);
  });

  it('GET /resources/:id/scopes', async () => {
    const response = await resourceRequest.get('/resources/foo/scopes');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockScope]);
    expect(findResourceById).toHaveBeenCalledWith('foo');
  });

  it('POST /resources/:id/scopes', async () => {
    const name = 'write:users';
    const description = 'description';

    const response = await resourceRequest
      .post('/resources/foo/scopes')
      .send({ name, description });

    expect(response.status).toEqual(200);
    expect(findResourceById).toHaveBeenCalledWith('foo');
    expect(insertScope).toHaveBeenCalledWith({
      id: 'randomId',
      name,
      description,
      resourceId: 'foo',
    });
  });

  it('PATCH /resources/:id/scopes/:scopeId', async () => {
    const name = 'write:users';
    const description = 'description';

    const response = await resourceRequest
      .patch('/resources/foo/scopes/foz')
      .send({ name, description });

    expect(response.status).toEqual(200);
    expect(findResourceById).toHaveBeenCalledWith('foo');
    expect(updateScopeById).toHaveBeenCalledWith('foz', {
      name,
      description,
    });
  });

  it('DELETE /resources/:id/scopes/:scopeId', async () => {
    await expect(resourceRequest.delete('/resources/foo/scopes/foz')).resolves.toHaveProperty(
      'status',
      204
    );
  });
});
