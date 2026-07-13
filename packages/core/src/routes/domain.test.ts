import { type Domain, DomainVerificationFileContentType } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockDomain, mockDomainResponse } from '#src/__mocks__/domain.js';
import { EnvSet } from '#src/env-set/index.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const { assertCustomDomainLimit: mockAssertCustomDomainLimit } = mockEsm(
  '#src/utils/domain.js',
  () => ({
    // eslint-disable-next-line unicorn/no-useless-undefined
    assertCustomDomainLimit: jest.fn(async () => undefined),
  })
);

const domains = {
  findAllDomains: jest.fn(async (): Promise<Domain[]> => [mockDomain]),
  findDomainById: async (id: string): Promise<Domain> => {
    const domain = [mockDomain].find((domain) => domain.id === id);
    if (!domain) {
      throw new Error('Not found');
    }
    return domain;
  },
  findDomain: jest.fn(async (domain: string) => {
    return [mockDomain].find((item) => item.domain === domain) ?? null;
  }),
  updateDomainById: jest.fn(
    async (id: string, data: Partial<Domain>): Promise<Domain> => ({
      ...mockDomain,
      ...data,
      id,
    })
  ),
};

const syncDomainStatus = jest.fn(async (domain: Domain): Promise<Domain> => domain);
const addDomain = jest.fn(
  async (domain: string): Promise<Domain> => ({
    ...mockDomain,
    domain,
  })
);
const deleteDomain = jest.fn();
const cleanupDomains = jest.fn();

const mockLibraries = {
  domains: {
    syncDomainStatus,
    addDomain,
    deleteDomain,
    cleanupDomains,
  },
  quota: createMockQuotaLibrary(),
  samlApplications: {
    syncCustomDomainsToSamlApplicationRedirectUrls: jest.fn(),
  },
  protectedApps: {
    syncAllAppConfigsToRemote: jest.fn(),
  },
};

const tenantContext = new MockTenant(undefined, { domains }, undefined, mockLibraries);

const domainRoutes = await pickDefault(import('./domain.js'));
const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;
Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);

describe('domain routes', () => {
  const domainRequest = createRequester({ authedRoutes: domainRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  it('GET /domains', async () => {
    const response = await domainRequest.get('/domains');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual([mockDomainResponse]);
  });

  it('GET /domains/:id', async () => {
    const response = await domainRequest.get(`/domains/${mockDomain.id}`);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(mockDomainResponse);
  });

  it('POST /domains', async () => {
    domains.findAllDomains.mockResolvedValueOnce([]);
    const response = await domainRequest.post('/domains').send({ domain: 'test.com' });
    expect(mockAssertCustomDomainLimit).toHaveBeenCalledTimes(1);
    expect(addDomain).toBeCalledWith('test.com');
    expect(response.status).toEqual(201);
    expect(response.body.id).toBeTruthy();
    expect(response.body.domain).toEqual('test.com');
  });

  it('POST /domains should fail when domain already exists (duplicate domain)', async () => {
    await expect(
      domainRequest.post('/domains').send({ domain: mockDomain.domain })
    ).resolves.toHaveProperty('status', 422);
  });

  it('POST /domains should allow creating multiple different domains', async () => {
    domains.findAllDomains.mockResolvedValueOnce([mockDomain]);
    domains.findDomain.mockResolvedValueOnce(null);
    const response = await domainRequest.post('/domains').send({ domain: 'another.com' });
    expect(mockAssertCustomDomainLimit).toHaveBeenCalledTimes(1);
    expect(addDomain).toBeCalledWith('another.com');
    expect(response.status).toEqual(201);
    expect(response.body.domain).toEqual('another.com');
  });

  it('POST /domains/cleanup', async () => {
    cleanupDomains.mockResolvedValueOnce({
      scannedCount: 3,
      deletedCount: 1,
      skippedActiveCount: 2,
      failedCount: 0,
    });

    const response = await domainRequest.post('/domains/cleanup').send({ staleDays: 14 });

    expect(response.status).toEqual(200);
    expect(cleanupDomains).toHaveBeenCalledWith(14);
    expect(
      mockLibraries.samlApplications.syncCustomDomainsToSamlApplicationRedirectUrls
    ).toHaveBeenCalledTimes(1);
    expect(mockLibraries.protectedApps.syncAllAppConfigsToRemote).toHaveBeenCalledTimes(1);
    expect(response.body).toEqual({
      scannedCount: 3,
      deletedCount: 1,
      skippedActiveCount: 2,
      failedCount: 0,
    });
  });

  it('GET /domains/:id/verification-files', async () => {
    const response = await domainRequest.get(`/domains/${mockDomain.id}/verification-files`);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([]);
  });

  it('PUT /domains/:id/verification-files', async () => {
    const verificationFiles = [
      {
        path: '/verify.txt',
        content: 'verification-content',
        contentType: DomainVerificationFileContentType.Text,
      },
    ];
    const response = await domainRequest
      .put(`/domains/${mockDomain.id}/verification-files`)
      .send({ verificationFiles });

    expect(response.status).toEqual(200);
    expect(response.body).toEqual(verificationFiles);
    expect(domains.updateDomainById).toHaveBeenCalledWith(mockDomain.id, { verificationFiles });
  });

  it('PUT /domains/:id/verification-files rejects invalid paths', async () => {
    const response = await domainRequest.put(`/domains/${mockDomain.id}/verification-files`).send({
      verificationFiles: [
        {
          path: '/nested/verify.txt',
          content: 'verification-content',
          contentType: DomainVerificationFileContentType.Text,
        },
      ],
    });

    expect(response.status).toEqual(400);
    expect(domains.updateDomainById).not.toHaveBeenCalled();
  });

  it('DELETE /domains/:id', async () => {
    await expect(domainRequest.delete(`/domains/${mockDomain.id}`)).resolves.toHaveProperty(
      'status',
      204
    );
    expect(deleteDomain).toBeCalledWith(mockDomain.id);
  });
});
