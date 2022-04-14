import { Application, CreateApplication, ApplicationType } from '@logto/schemas';
import nock from 'nock';

import { mockApplicationDTO, mockOidcConfig } from '@/__mocks__';
import { port } from '@/env/consts';
import { findApplicationById } from '@/queries/application';
import { createRequester } from '@/utils/test-utils';

import applicationRoutes from './application';

jest.mock('@/queries/application', () => ({
  findTotalNumberOfApplications: jest.fn(async () => ({ count: 10 })),
  findAllApplications: jest.fn(async () => [mockApplicationDTO]),
  findApplicationById: jest.fn(async () => mockApplicationDTO),
  deleteApplicationById: jest.fn(),
  insertApplication: jest.fn(
    async (body: CreateApplication): Promise<Application> => ({
      ...mockApplicationDTO,
      ...body,
      oidcClientMetadata: {
        ...mockApplicationDTO.oidcClientMetadata,
        ...body.oidcClientMetadata,
      },
    })
  ),
  updateApplicationById: jest.fn(
    async (_, data: Partial<CreateApplication>): Promise<Application> => ({
      ...mockApplicationDTO,
      ...data,
    })
  ),
}));

jest.mock('@/utils/id', () => ({
  // eslint-disable-next-line unicorn/consistent-function-scoping
  buildIdGenerator: jest.fn(() => () => 'randomId'),
}));

const customClientMetadata = {
  corsAllowedOrigins: ['http://localhost:5000', 'http://localhost:5001', 'https://silverhand.com'],
  idTokenTtl: 999_999,
  refreshTokenTtl: 100_000_000,
};

describe('application route', () => {
  const applicationRequest = createRequester({ authedRoutes: applicationRoutes });

  beforeEach(() => {
    const discoveryUrl = `http://localhost:${port}/oidc/.well-known/openid-configuration`;
    nock(discoveryUrl).get('').reply(200, mockOidcConfig);
  });

  it('GET /applications', async () => {
    const response = await applicationRequest.get('/applications');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockApplicationDTO]);
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
      ...mockApplicationDTO,
      id: 'randomId',
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
      ...mockApplicationDTO,
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
    expect(response.body).toEqual(mockApplicationDTO);
  });

  it('PATCH /applications/:applicationId', async () => {
    const name = 'FooApplication';
    const description = 'FooDescription';

    const response = await applicationRequest
      .patch('/applications/foo')
      .send({ name, description, customClientMetadata });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockApplicationDTO,
      name,
      description,
      customClientMetadata,
    });
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
