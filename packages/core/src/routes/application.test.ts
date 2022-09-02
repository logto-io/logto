import { Application, CreateApplication, ApplicationType } from '@logto/schemas';

import { mockApplication } from '@/__mocks__';
import { findApplicationById } from '@/queries/application';
import { createRequester } from '@/utils/test-utils';

import applicationRoutes from './application';

jest.mock('@/queries/application', () => ({
  findTotalNumberOfApplications: jest.fn(async () => ({ count: 10 })),
  findAllApplications: jest.fn(async () => [mockApplication]),
  findApplicationById: jest.fn(async () => mockApplication),
  deleteApplicationById: jest.fn(),
  insertApplication: jest.fn(
    async (body: CreateApplication): Promise<Application> => ({
      ...mockApplication,
      ...body,
      oidcClientMetadata: {
        ...mockApplication.oidcClientMetadata,
        ...body.oidcClientMetadata,
      },
    })
  ),
  updateApplicationById: jest.fn(
    async (_, data: Partial<CreateApplication>): Promise<Application> => ({
      ...mockApplication,
      ...data,
    })
  ),
}));

jest.mock('@/utils/id', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: jest.fn(() => () => 'randomId'),
  buildApplicationSecret: jest.fn(() => 'randomId'),
}));

const customClientMetadata = {
  corsAllowedOrigins: ['http://localhost:5000', 'http://localhost:5001', 'https://silverhand.com'],
  idTokenTtl: 999_999,
  refreshTokenTtl: 100_000_000,
};

const customOidcClientMetadata = {
  redirectUris: [],
  postLogoutRedirectUris: [],
};

describe('application route', () => {
  const applicationRequest = createRequester({ authedRoutes: applicationRoutes });

  it('GET /applications', async () => {
    const response = await applicationRequest.get('/applications');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockApplication]);
    expect(response.header).toHaveProperty('total-number', '10');
  });

  it('POST /applications', async () => {
    const name = 'FooApplication';
    const description = 'FooDescription';
    const type = ApplicationType.Traditional;

    const response = await applicationRequest
      .post('/applications')
      .send({ name, type, description });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockApplication,
      id: 'randomId',
      secret: 'randomId',
      name,
      description,
      type,
    });
  });

  it('POST /applications with custom client metadata', async () => {
    const name = 'FooApplication';
    const type = ApplicationType.Traditional;

    const response = await applicationRequest
      .post('/applications')
      .send({ name, type, customClientMetadata });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockApplication,
      id: 'randomId',
      name,
      type,
      customClientMetadata,
    });
  });

  it('POST /applications should throw with invalid input body', async () => {
    const name = 'FooApplication';
    const description = 'FooDescription';
    const type = ApplicationType.Traditional;

    await expect(applicationRequest.post('/applications')).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({ customClientMetadata })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({ name, description, customClientMetadata })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({ type, description, customClientMetadata })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({
        name,
        type,
        customClientMetadata: {
          ...customClientMetadata,
          corsAllowedOrigins: [''],
        },
      })
    ).resolves.toHaveProperty('status', 400);
  });

  it('GET /applications/:id', async () => {
    const response = await applicationRequest.get('/applications/foo');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockApplication);
  });

  it('PATCH /applications/:applicationId', async () => {
    const name = 'FooApplication';
    const description = 'FooDescription';

    const response = await applicationRequest
      .patch('/applications/foo')
      .send({ name, description, customClientMetadata });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ ...mockApplication, name, description, customClientMetadata });
  });

  it('PATCH /applications/:applicationId expect to throw with invalid properties', async () => {
    await expect(
      applicationRequest.patch('/applications/doo').send({ type: 'node' })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.patch('/applications/doo').send({
        customClientMetadata: {
          ...customClientMetadata,
          corsAllowedOrigins: [''],
        },
      })
    ).resolves.toHaveProperty('status', 400);
  });

  it('PATCH /applications/:applicationId should save the formatted URIs as per RFC', async () => {
    await expect(
      applicationRequest.patch('/applications/doo').send({
        oidcClientMetadata: {
          ...customClientMetadata,
          redirectUris: [
            'com.google.com://callback',
            'https://example.com/callback?auth=true',
            'http://example.com',
            'http://localhost:3002',
          ],
        },
      })
    ).resolves.toHaveProperty('status', 200);
  });

  it('PATCH /application/:applicationId expect to throw with invalid redirectURI', async () => {
    await expect(
      applicationRequest.patch('/applications/doo').send({
        oidcClientMetadata: {
          ...customOidcClientMetadata,
          redirectUris: ['com.google.com'],
        },
      })
    ).resolves.toHaveProperty('status', 400);
  });

  it('DELETE /applications/:applicationId', async () => {
    await expect(applicationRequest.delete('/applications/foo')).resolves.toHaveProperty(
      'status',
      204
    );
  });

  it('DELETE /applications/:applicationId', async () => {
    await expect(applicationRequest.delete('/applications/foo')).resolves.toHaveProperty(
      'status',
      204
    );
  });

  it('DELETE /applications/:applicationId should throw if application not found', async () => {
    const mockFindApplicationById = findApplicationById as jest.Mock;
    mockFindApplicationById.mockRejectedValueOnce(new Error(' '));

    await expect(applicationRequest.delete('/applications/foo')).resolves.toHaveProperty(
      'status',
      500
    );
  });
});
