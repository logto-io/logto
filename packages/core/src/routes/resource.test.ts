import { Resource, CreateResource } from '@logto/schemas';

import { deleteResourceById } from '@/queries/resource';
import { deleteScopesByResourceId } from '@/queries/scope';
import { mockResource, mockScope } from '@/utils/mock';
import { createRequester } from '@/utils/test-utils';

import resourceRoutes from './resource';

jest.mock('@/queries/resource', () => ({
  findTotalNumberOfResources: jest.fn(async () => ({ count: 10 })),
  findAllResources: jest.fn(async (): Promise<Resource[]> => [mockResource]),
  findResourceById: jest.fn(async (): Promise<Resource> => mockResource),
  insertResource: jest.fn(
    async (body: CreateResource): Promise<Resource> => ({
      ...mockResource,
      ...body,
    })
  ),
  updateResourceById: jest.fn(
    async (_, data: Partial<CreateResource>): Promise<Resource> => ({
      ...mockResource,
      ...data,
    })
  ),
  deleteResourceById: jest.fn(),
}));

jest.mock('@/queries/scope', () => ({
  findAllScopesWithResourceId: jest.fn(async () => [mockScope]),
  deleteScopesByResourceId: jest.fn(),
}));

jest.mock('@/utils/id', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: jest.fn(() => () => 'randomId'),
}));

describe('resource routes', () => {
  const resourceRequest = createRequester({ authedRoutes: resourceRoutes });

  it('GET /resources', async () => {
    const response = await resourceRequest.get('/resources');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockResource]);
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
      scopes: [mockScope],
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
      scopes: [mockScope],
    });
  });

  it('PATCH /resources/:id should throw with invalid propreties', async () => {
    const response = await resourceRequest.patch('/resources/foo').send({ indicator: 12 });
    expect(response.status).toEqual(400);
  });

  it('DELETE /resources/:id', async () => {
    const resourceId = 'foo';
    await expect(resourceRequest.delete(`/resources/${resourceId}`)).resolves.toHaveProperty(
      'status',
      204
    );
    expect(deleteScopesByResourceId).toHaveBeenCalledWith(resourceId);
    expect(deleteResourceById).toHaveBeenCalledWith(resourceId);
  });
});
