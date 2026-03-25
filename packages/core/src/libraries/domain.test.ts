import { DomainStatus } from '@logto/schemas';
import { addDays } from 'date-fns';
import { createMockUtils } from '@logto/shared/esm';

import {
  mockCloudflareData,
  mockCloudflareDataActive,
  mockCloudflareDataPendingSSL,
  mockCreatedAtForDomain,
  mockDomain,
  mockDomainWithCloudflareData,
} from '#src/__mocks__/domain.js';
import RequestError from '#src/errors/RequestError/index.js';
import SystemContext from '#src/tenants/SystemContext.js';
import { mockFallbackOrigin } from '#src/utils/cloudflare/mock.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const { getCustomHostname, createCustomHostname, deleteCustomHostname } = await mockEsmWithActual(
  '#src/utils/cloudflare/index.js',
  () => ({
    createCustomHostname: jest.fn(async () => mockCloudflareData),
    getCustomHostname: jest.fn(async () => mockCloudflareData),
    deleteCustomHostname: jest.fn(),
    getFallbackOrigin: jest.fn(async () => mockFallbackOrigin),
  })
);

const { clearCustomDomainCache } = await mockEsmWithActual('#src/utils/tenant.js', () => ({
  clearCustomDomainCache: jest.fn(),
}));

const { MockQueries } = await import('#src/test-utils/tenant.js');
const { createDomainLibrary } = await import('./domain.js');

const updateDomainById = jest.fn(async (_, data) => data);
const insertDomain = jest.fn(async (data) => data);
const findDomainById = jest.fn(async () => mockDomain);
const findAllDomains = jest.fn(async () => [mockDomain]);
const deleteDomainById = jest.fn();
const { syncDomainStatus, addDomain, deleteDomain, cleanupDomains } = createDomainLibrary(
  new MockQueries({
    domains: { updateDomainById, insertDomain, findDomainById, findAllDomains, deleteDomainById },
  })
);

beforeAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.hostnameProviderConfig = {
    zoneId: 'fake_zone_id',
    apiToken: '',
    blockedDomains: ['blocked.com'],
  };
});

afterAll(() => {
  // eslint-disable-next-line @silverhand/fp/no-mutation
  SystemContext.shared.hostnameProviderConfig = undefined;
});

afterEach(() => {
  vi.useRealTimers();
  clearCustomDomainCache.mockClear();
  updateDomainById.mockClear();
  insertDomain.mockClear();
  findDomainById.mockClear();
  findAllDomains.mockClear();
  deleteDomainById.mockClear();
});

describe('addDomain()', () => {
  it('should call createCustomHostname and return cloudflare data', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(mockCreatedAtForDomain));

    const response = await addDomain(mockDomain.domain);
    expect(createCustomHostname).toBeCalledTimes(1);
    expect(insertDomain).toBeCalledTimes(1);
    expect(insertDomain).toHaveBeenCalledWith(
      expect.objectContaining({ nonActiveSince: mockCreatedAtForDomain })
    );
    expect(clearCustomDomainCache).toBeCalledTimes(1);
    expect(response.cloudflareData).toMatchObject(mockCloudflareData);
    expect(response.dnsRecords).toContainEqual({
      type: 'CNAME',
      name: mockDomainWithCloudflareData.domain,
      value: mockFallbackOrigin,
    });
  });

  it('should throw for blocked domain', async () => {
    await expect(addDomain('hi.blocked.com')).rejects.toMatchError(
      new RequestError({ code: 'domain.domain_is_not_allowed' })
    );
  });
});

describe('syncDomainStatus()', () => {
  it('should clear nonActiveSince when domain becomes active', async () => {
    getCustomHostname.mockResolvedValueOnce(mockCloudflareDataActive);

    const response = await syncDomainStatus({
      ...mockDomainWithCloudflareData,
      status: DomainStatus.PendingVerification,
      nonActiveSince: mockCreatedAtForDomain,
    });

    expect(updateDomainById).toHaveBeenCalledWith(
      mockDomain.id,
      expect.objectContaining({ status: DomainStatus.Active, nonActiveSince: null }),
      'replace'
    );
    expect(response.nonActiveSince).toBeNull();
  });

  it('should preserve nonActiveSince when domain stays non-active', async () => {
    const response = await syncDomainStatus({
      ...mockDomainWithCloudflareData,
      status: DomainStatus.PendingVerification,
      nonActiveSince: mockCreatedAtForDomain,
    });

    expect(updateDomainById).toHaveBeenCalledWith(
      mockDomain.id,
      expect.objectContaining({
        status: DomainStatus.PendingVerification,
        nonActiveSince: mockCreatedAtForDomain,
      }),
      'replace'
    );
    expect(response.nonActiveSince).toBe(mockCreatedAtForDomain);
  });

  it('should set nonActiveSince when domain changes from active to non-active', async () => {
    const now = addDays(new Date(mockCreatedAtForDomain), 7);
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const response = await syncDomainStatus({
      ...mockDomainWithCloudflareData,
      status: DomainStatus.Active,
      nonActiveSince: null,
    });

    expect(updateDomainById).toHaveBeenCalledWith(
      mockDomain.id,
      expect.objectContaining({
        status: DomainStatus.PendingVerification,
        nonActiveSince: now.getTime(),
      }),
      'replace'
    );
    expect(response.nonActiveSince).toBe(now.getTime());
  });
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
    expect(clearCustomDomainCache).toBeCalledTimes(1);
    expect(response.cloudflareData).toMatchObject(mockCloudflareData);
  });

  it('should sync and get result with pendingVerification', async () => {
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.status).toBe(DomainStatus.PendingVerification);
  });

  it('should sync and get result with pendingSsl', async () => {
    getCustomHostname.mockResolvedValueOnce(mockCloudflareDataPendingSSL);
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.status).toBe(DomainStatus.PendingSsl);
  });

  it('should sync and get result with active', async () => {
    getCustomHostname.mockResolvedValueOnce(mockCloudflareDataActive);
    const response = await syncDomainStatus(mockDomainWithCloudflareData);
    expect(response.status).toBe(DomainStatus.Active);
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

describe('cleanupDomains()', () => {
  it('should delete stale non-active domains and skip recovered active domains', async () => {
    const now = addDays(new Date(mockCreatedAtForDomain), 30);
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const staleDomain = {
      ...mockDomainWithCloudflareData,
      id: 'stale-domain',
      domain: 'stale.example.com',
      status: DomainStatus.PendingVerification,
      nonActiveSince: addDays(now, -20).getTime(),
    };
    const recoveredDomain = {
      ...mockDomainWithCloudflareData,
      id: 'recovered-domain',
      domain: 'recovered.example.com',
      status: DomainStatus.PendingVerification,
      nonActiveSince: addDays(now, -20).getTime(),
    };
    findAllDomains.mockResolvedValueOnce([staleDomain, recoveredDomain]);
    getCustomHostname.mockResolvedValueOnce(mockCloudflareData);
    getCustomHostname.mockResolvedValueOnce(mockCloudflareDataActive);

    const summary = await cleanupDomains(14);

    expect(summary).toEqual({
      scannedCount: 2,
      staleCandidateCount: 2,
      deletedCount: 1,
      skippedActiveCount: 1,
      failedCount: 0,
    });
    expect(deleteCustomHostname).toHaveBeenCalledTimes(1);
    expect(deleteCustomHostname).toHaveBeenCalledWith(
      expect.anything(),
      staleDomain.cloudflareData.id
    );
    expect(deleteDomainById).toHaveBeenCalledWith(staleDomain.id);
  });

  it('should tolerate cloudflare not found when deleting stale domains', async () => {
    const now = addDays(new Date(mockCreatedAtForDomain), 30);
    vi.useFakeTimers();
    vi.setSystemTime(now);

    const staleDomain = {
      ...mockDomainWithCloudflareData,
      id: 'stale-domain',
      nonActiveSince: addDays(now, -20).getTime(),
    };
    findAllDomains.mockResolvedValueOnce([staleDomain]);
    getCustomHostname.mockResolvedValueOnce(mockCloudflareData);
    deleteCustomHostname.mockRejectedValueOnce(
      new RequestError({ code: 'domain.cloudflare_not_found' })
    );

    const summary = await cleanupDomains(14);

    expect(summary.deletedCount).toBe(1);
    expect(summary.failedCount).toBe(0);
    expect(deleteDomainById).toHaveBeenCalledWith(staleDomain.id);
  });
});

describe('deleteDomain()', () => {
  afterEach(() => {
    deleteDomainById.mockClear();
    deleteCustomHostname.mockClear();
  });

  it('should delete from remote and then delete local record', async () => {
    findDomainById.mockResolvedValueOnce(mockDomainWithCloudflareData);
    await deleteDomain(mockDomain.id);
    expect(deleteCustomHostname).toBeCalledTimes(1);
    expect(clearCustomDomainCache).toBeCalledTimes(1);
    expect(deleteDomainById).toBeCalledTimes(1);
  });

  it('should delete local record for non-synced domain', async () => {
    findDomainById.mockResolvedValueOnce(mockDomain);
    await deleteDomain(mockDomain.id);
    expect(deleteCustomHostname).not.toBeCalled();
    expect(clearCustomDomainCache).toBeCalledTimes(1);
    expect(deleteDomainById).toBeCalledTimes(1);
  });

  it('should delete local record even if the record is not found in remote', async () => {
    findDomainById.mockResolvedValueOnce(mockDomainWithCloudflareData);
    deleteCustomHostname.mockRejectedValueOnce(
      new RequestError({ code: 'domain.cloudflare_not_found' })
    );
    await expect(deleteDomain(mockDomain.id)).resolves.not.toThrow();
    expect(clearCustomDomainCache).toBeCalledTimes(1);
    expect(deleteDomainById).toBeCalledTimes(1);
  });
});
