import type { Resource, CreateResource } from '@logto/schemas';

import { mockResource } from '@/__mocks__';
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

jest.mock('@logto/shared', () => ({
  generateStandardId: jest.fn(() => 'randomId'),
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

  it('PATCH /resources/:id should throw with invalid properties', async () => {
    const response = await resourceRequest.patch('/resources/foo').send({ indicator: 12 });
    expect(response.status).toEqual(400);
  });

  it('DELETE /resources/:id', async () => {
    await expect(resourceRequest.delete('/resources/foo')).resolves.toHaveProperty('status', 204);
  });
});
