import { Application, CreateApplication, ApplicationType } from '@logto/schemas';

import { findApplicationById } from '@/queries/application';
import { mockApplication } from '@/utils/mock';
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
}));

describe('application route', () => {
  const applicationRequest = createRequester(applicationRoutes);

  it('GET /applications', async () => {
    const response = await applicationRequest.get('/applications');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockApplication]);
    expect(response.header).toHaveProperty('total-number', '10');
  });

  it('POST /applications', async () => {
    const name = 'FooApplication';
    const type = ApplicationType.Traditional;
    const description = 'New created application';

    const response = await applicationRequest.post('/applications').send({
      name,
      type,
      description,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockApplication,
      id: 'randomId',
      name,
      type,
      description,
    });
  });

  it('POST /applications should throw with invalid input body', async () => {
    const name = 'FooApplication';
    const type = ApplicationType.Traditional;
    const description = 'New created application';

    await expect(applicationRequest.post('/applications')).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({ description })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({ name, description })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({ type, description })
    ).resolves.toHaveProperty('status', 400);
  });

  it('GET /applications/:id', async () => {
    const response = await applicationRequest.get('/applications/foo');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockApplication);
  });

  it('PATCH /applications/:applicationId', async () => {
    const name = 'FooApplication';
    const description = 'New created application';

    const response = await applicationRequest.patch('/applications/foo').send({
      name,
      description,
    });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockApplication,
      name,
      description,
    });
  });

  it('PATCH /applications/:applicationId expect to throw with invalid properties', async () => {
    await expect(
      applicationRequest.patch('/applications/doo').send({ type: 'node' })
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
