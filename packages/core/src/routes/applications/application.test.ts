import type { Application, CreateApplication } from '@logto/schemas';
import { ApplicationType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import {
  mockApplication,
  mockProtectedAppConfigProviderConfig,
  mockCustomDomain,
  mockProtectedApplication,
} from '#src/__mocks__/index.js';
import { protectedAppSignInCallbackUrl } from '#src/constants/index.js';
import { mockId, mockIdGenerators } from '#src/test-utils/nanoid.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const findApplicationById = jest.fn(async () => mockApplication);
const deleteApplicationById = jest.fn();
const syncAppConfigsToRemote = jest.fn();
const deleteRemoteAppConfigs = jest.fn();
const buildProtectedAppData = jest.fn(async () => {
  const { oidcClientMetadata, protectedAppMetadata } = mockProtectedApplication;

  return { oidcClientMetadata, protectedAppMetadata };
});
const updateApplicationById = jest.fn(
  async (_, data: Partial<CreateApplication>): Promise<Application> => ({
    ...mockApplication,
    ...data,
  })
);

await mockIdGenerators();

const tenantContext = new MockTenant(
  undefined,
  {
    applications: {
      countApplications: jest.fn(async () => ({ count: 10 })),
      findApplications: jest.fn(async () => [mockApplication]),
      findApplicationById,
      deleteApplicationById,
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
      updateApplicationById,
    },
  },
  undefined,
  {
    quota: createMockQuotaLibrary(),
    protectedApps: {
      syncAppConfigsToRemote,
      deleteRemoteAppConfigs,
      buildProtectedAppData,
      getDefaultDomain: jest.fn(async () => mockProtectedAppConfigProviderConfig.domain),
    },
  }
);

const { createRequester } = await import('#src/utils/test-utils.js');
const applicationRoutes = await pickDefault(import('./application.js'));

const customClientMetadata = {
  corsAllowedOrigins: [
    'http://localhost:5000',
    // OGCIO - formsie port collision fixed
    'http://localhost:7001',
    'https://silverhand.com',
    'capacitor://localhost',
  ],
  idTokenTtl: 999_999,
  refreshTokenTtl: 100_000_000,
};

describe('application route', () => {
  afterEach(() => {
    updateApplicationById.mockClear();
    syncAppConfigsToRemote.mockClear();
    deleteRemoteAppConfigs.mockClear();
  });

  const applicationRequest = createRequester({ authedRoutes: applicationRoutes, tenantContext });

  it('GET /applications', async () => {
    const response = await applicationRequest.get('/applications');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockApplication]);
    expect(response.header).not.toHaveProperty('total-number');
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
      id: mockId,
      secret: mockId,
      name,
      description,
      type,
    });
  });

  it('POST /applications for protected app', async () => {
    const name = 'FooApplication';
    const type = ApplicationType.Protected;
    const { protectedAppMetadata } = mockProtectedApplication;

    const response = await applicationRequest.post('/applications').send({
      name,
      type,
      protectedAppMetadata: {
        subDomain: 'mock',
        origin: protectedAppMetadata.origin,
      },
    });
    expect(response.status).toEqual(200);
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockId);
    expect(response.body).toEqual({
      ...mockApplication,
      id: mockId,
      name,
      type,
      protectedAppMetadata,
      oidcClientMetadata: {
        redirectUris: [`https://${protectedAppMetadata.host}/${protectedAppSignInCallbackUrl}`],
        postLogoutRedirectUris: [`https://${protectedAppMetadata.host}`],
      },
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
      id: mockId,
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
    await expect(
      applicationRequest.post('/applications').send({
        name,
        type: ApplicationType.Protected,
      })
    ).resolves.toHaveProperty('status', 400);
    await expect(
      applicationRequest.post('/applications').send({
        name,
        type: ApplicationType.Protected,
        protectedAppMetadata: {
          host: 'https://example.com',
        },
      })
    ).resolves.toHaveProperty('status', 400);
  });

  it('GET /applications/:id', async () => {
    const response = await applicationRequest.get('/applications/foo');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      ...mockApplication,
      isAdmin: false,
    });
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

  it('PATCH /applications/:applicationId for protected app', async () => {
    findApplicationById.mockResolvedValueOnce(mockProtectedApplication);
    const name = 'FooApplication';
    const description = 'FooDescription';
    const origin = 'https://example.com';

    const response = await applicationRequest
      .patch('/applications/foo')
      .send({ name, description, protectedAppMetadata: { origin } });
    expect(response.status).toEqual(200);
    expect(response.body).toEqual({ ...mockApplication, name, description });
    expect(syncAppConfigsToRemote).toHaveBeenCalledWith('foo');
    expect(updateApplicationById).toHaveBeenNthCalledWith(1, 'foo', {
      protectedAppMetadata: { ...mockProtectedApplication.protectedAppMetadata, origin },
    });
  });

  it('PATCH /applications/:applicationId expect to throw with invalid properties', async () => {
    await expect(
      applicationRequest.patch('/applications/doo').send({
        customClientMetadata: 'test',
      })
    ).resolves.toHaveProperty('status', 400);
  });

  it('PATCH /applications/:applicationId should not allow update application secret, isThirdParty and type', async () => {
    const response = await applicationRequest.patch('/applications/foo').send({
      type: ApplicationType.Native,
      isThirdParty: true,
      secret: 'test',
    });

    expect(response.status).toEqual(200);

    // Should not update the secret, isThirdParty and type
    expect(response.body).toEqual(mockApplication);
  });

  it('PATCH /applications/:applicationId should save the formatted URIs as per RFC', async () => {
    await expect(
      applicationRequest.patch('/applications/foo').send({
        oidcClientMetadata: {
          redirectUris: [
            'https://example.com/callback?auth=true',
            'https://Example.com',
            'http://127.0.0.1',
            'http://localhost:3002',
          ],
          postLogoutRedirectUris: [],
        },
      })
    ).resolves.toHaveProperty('status', 200);
  });

  it('PATCH /application/:applicationId expect to throw with invalid redirectURI', async () => {
    await expect(
      applicationRequest.patch('/applications/foo').send({
        oidcClientMetadata: {
          redirectUris: ['www.example.com', 'com.example://callback'],
          postLogoutRedirectUris: [],
        },
      })
    ).resolves.toHaveProperty('status', 400);
  });

  it('PATCH /application/:applicationId should save the formatted custom scheme URIs for native apps', async () => {
    await expect(
      applicationRequest.patch('/applications/foo').send({
        type: ApplicationType.Native,
        oidcClientMetadata: {
          redirectUris: [
            'com.example://demo-app/callback',
            'com.example://callback',
            'io.logto://Abc123',
          ],
          postLogoutRedirectUris: [],
        },
      })
    ).resolves.toHaveProperty('status', 200);
  });

  it('PATCH /application/:applicationId expect to throw with invalid custom scheme for native apps', async () => {
    await expect(
      applicationRequest.patch('/applications/foo').send({
        type: ApplicationType.Native,
        oidcClientMetadata: {
          redirectUris: ['https://www.example.com', 'com.example/callback'],
          postLogoutRedirectUris: [],
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

  it('DELETE /applications/:applicationId for protected app', async () => {
    findApplicationById.mockResolvedValueOnce(mockProtectedApplication);
    await expect(applicationRequest.delete('/applications/foo')).resolves.toHaveProperty(
      'status',
      204
    );
    expect(deleteRemoteAppConfigs).toHaveBeenCalledWith(
      mockProtectedApplication.protectedAppMetadata.host
    );
  });

  it('DELETE /applications/:applicationId should throw if application not found', async () => {
    deleteApplicationById.mockRejectedValueOnce(new Error(' '));

    await expect(applicationRequest.delete('/applications/foo')).resolves.toHaveProperty(
      'status',
      500
    );
  });

  it('DELETE /applications/:applicationId should throw if custom domains are not empty', async () => {
    findApplicationById.mockResolvedValueOnce({
      ...mockProtectedApplication,
      protectedAppMetadata: {
        ...mockProtectedApplication.protectedAppMetadata,
        customDomains: [mockCustomDomain],
      },
    });
    await expect(applicationRequest.delete('/applications/foo')).resolves.toHaveProperty(
      'status',
      422
    );
  });
});
