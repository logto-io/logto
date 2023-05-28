import { DomainStatus } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import {
  mockCloudflareData,
  mockCloudflareDataActive,
  mockCloudflareDataPendingSSL,
  mockDomain,
  mockDomainWithCloudflareData,
  mockSslTxtName,
  mockSslTxtValue,
  mockTxtName,
  mockTxtValue,
} from '#src/__mocks__/domain.js';
import RequestError from '#src/errors/RequestError/index.js';
import SystemContext from '#src/tenants/SystemContext.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const { getCustomHostname, createCustomHostname } = mockEsm(
  '#src/utils/cloudflare/index.js',
  () => ({
    createCustomHostname: jest.fn(async () => mockCloudflareData),
    getCustomHostname: jest.fn(async () => mockCloudflareData),
  })
);

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createDomainLibrary } = await import('./domain.js');

const updateDomainById = jest.fn(async (_, data) => data);
const { syncDomainStatus, addDomainToCloudflare } = createDomainLibrary(
  new MockQueries({ domains: { updateDomainById } })
);

const fallbackOrigin = 'fake_origin';
beforeAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.hostnameProviderConfig = {
    zoneId: 'fake_zone_id',
    apiToken: '',
    fallbackOrigin,
  };
});

afterAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.hostnameProviderConfig = undefined;
});

describe('addDomainToCloudflare()', () => {
  it('should call createCustomHostname and return cloudflare data', async () => {
    const response = await addDomainToCloudflare(mockDomain, 'fake_origin');
    expect(createCustomHostname).toBeCalledTimes(1);
    expect(updateDomainById).toBeCalledTimes(1);
    expect(response.cloudflareData).toMatchObject(mockCloudflareData);
  });
});

describe('syncDomainStatus()', () => {
  it('should fail if domain.cloudflareData is missing', async () => {
    await expect(syncDomainStatus(mockDomain)).rejects.toMatchError(
      new RequestError({ code: 'domain.cloudflare_data_missing' })
    );
  });

  it('should get new cloudflare data', async () => {
    const response = await syncDomainStatus({
      ...mockDomainWithCloudflareData,
      cloudflareData: mockCloudflareDataPendingSSL,
    });
    expect(getCustomHostname).toBeCalledTimes(1);
    expect(response.cloudflareData).toMatchObject(mockCloudflareData);
  });

  it('should sync and get result with pendingVerification', async () => {
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.status).toBe(DomainStatus.PendingVerification);
    expect(response.dnsRecords).toContainEqual({
      type: 'CNAME',
      name: mockDomainWithCloudflareData.domain,
      value: fallbackOrigin,
    });
    expect(response.dnsRecords).toContainEqual({
      type: 'TXT',
      name: mockTxtName,
      value: mockTxtValue,
    });
    expect(response.dnsRecords).toContainEqual({
      type: 'TXT',
      name: mockSslTxtName,
      value: mockSslTxtValue,
    });
  });

  it('should sync and get result with pendingSsl', async () => {
    getCustomHostname.mockResolvedValueOnce(mockCloudflareDataPendingSSL);
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.status).toBe(DomainStatus.PendingSsl);
    expect(response.dnsRecords).not.toContainEqual({
      type: 'CNAME',
      name: mockDomainWithCloudflareData.domain,
      value: fallbackOrigin,
    });
    expect(response.dnsRecords).not.toContainEqual({
      type: 'TXT',
      name: mockTxtName,
      value: mockTxtValue,
    });
    expect(response.dnsRecords).toContainEqual({
      type: 'TXT',
      name: mockSslTxtName,
      value: mockSslTxtValue,
    });
  });

  it('should sync and get result with active', async () => {
    getCustomHostname.mockResolvedValueOnce(mockCloudflareDataActive);
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.status).toBe(DomainStatus.Active);
    expect(response.dnsRecords).not.toContainEqual({
      type: 'CNAME',
      name: mockDomainWithCloudflareData.domain,
      value: fallbackOrigin,
    });
    expect(response.dnsRecords).not.toContainEqual({
      type: 'TXT',
      name: mockTxtName,
      value: mockTxtValue,
    });
    expect(response.dnsRecords).not.toContainEqual({
      type: 'TXT',
      name: mockSslTxtName,
      value: mockSslTxtValue,
    });
  });

  it('should sync and get verification error', async () => {
    getCustomHostname.mockResolvedValueOnce({
      ...mockCloudflareDataActive,
      verification_errors: ['fake_error'],
    });
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.errorMessage).toContain('fake_error');
  });

  it('should sync and get ssl error', async () => {
    getCustomHostname.mockResolvedValueOnce({
      ...mockCloudflareDataActive,
      ssl: {
        ...mockCloudflareDataActive.ssl,
        validation_errors: [{ message: 'fake_error' }],
      },
    });
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.errorMessage).toContain('fake_error');
  });
});
