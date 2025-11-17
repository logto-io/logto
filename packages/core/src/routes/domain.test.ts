import { type Domain } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { mockDomain, mockDomainResponse } from '#src/__mocks__/domain.js';
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
};

const syncDomainStatus = jest.fn(async (domain: Domain): Promise<Domain> => domain);
const addDomain = jest.fn(
  async (domain: string): Promise<Domain> => ({
    ...mockDomain,
    domain,
  })
);
const deleteDomain = jest.fn();

const mockLibraries = {
  domains: {
    syncDomainStatus,
    addDomain,
    deleteDomain,
  },
  quota: createMockQuotaLibrary(),
  samlApplications: {
    syncCustomDomainsToSamlApplicationRedirectUrls: jest.fn(),
  },
};

const tenantContext = new MockTenant(undefined, { domains }, undefined, mockLibraries);

const domainRoutes = await pickDefault(import('./domain.js'));

describe('domain routes', () => {
  const domainRequest = createRequester({ authedRoutes: domainRoutes, tenantContext });

  afterEach(() => {
    jest.clearAllMocks();
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

  it('DELETE /domains/:id', async () => {
    await expect(domainRequest.delete(`/domains/${mockDomain.id}`)).resolves.toHaveProperty(
      'status',
      204
    );
    expect(deleteDomain).toBeCalledWith(mockDomain.id);
  });
});
