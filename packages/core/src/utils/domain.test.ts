import RequestError from '#src/errors/RequestError/index.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';

import { maxCustomDomains } from '../constants/index.js';

import { assertCustomDomainLimit, isSubdomainOf } from './domain.js';

const { jest } = import.meta;

const createQuotaLibraryMock = () => {
  const quotaLibrary = createMockQuotaLibrary();
  const guardTenantUsageByKey = jest.mocked(quotaLibrary.guardTenantUsageByKey);
  guardTenantUsageByKey.mockResolvedValue();

  return {
    quotaLibrary,
    guardTenantUsageByKey,
  };
};

describe('isSubdomainOf()', () => {
  it('should return true if the given domain is a subdomain of a domain', () => {
    expect(isSubdomainOf('subdomain.domain.com', 'domain.com')).toBe(true);
  });

  it('should return false if the given domain is not a subdomain of a domain', () => {
    expect(isSubdomainOf('subdomain.domain.com', 'domain.org')).toBe(false);
    expect(isSubdomainOf('subdomaindomain.com', 'domain.org')).toBe(false);
  });
});

describe('assertCustomDomainLimit()', () => {
  it('allows private regions to create domains while under the cap', async () => {
    const { quotaLibrary, guardTenantUsageByKey } = createQuotaLibraryMock();

    await expect(
      assertCustomDomainLimit({
        isPrivateRegionFeature: true,
        quotaLibrary,
        existingDomainCount: maxCustomDomains - 1,
      })
    ).resolves.toBeUndefined();

    expect(guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('throws when a private region exceeds the global cap', async () => {
    const { quotaLibrary, guardTenantUsageByKey } = createQuotaLibraryMock();

    await expect(
      assertCustomDomainLimit({
        isPrivateRegionFeature: true,
        quotaLibrary,
        existingDomainCount: maxCustomDomains,
      })
    ).rejects.toMatchError(
      new RequestError({
        code: 'domain.exceed_domain_limit',
        status: 422,
        limit: maxCustomDomains,
      })
    );

    expect(guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('should check quota guard when private region feature is disabled', async () => {
    const { quotaLibrary, guardTenantUsageByKey } = createQuotaLibraryMock();

    await expect(
      assertCustomDomainLimit({
        isPrivateRegionFeature: false,
        quotaLibrary,
        existingDomainCount: 5,
      })
    ).resolves.toBeUndefined();

    expect(guardTenantUsageByKey).toHaveBeenCalledTimes(1);
    expect(guardTenantUsageByKey).toHaveBeenCalledWith('customDomainsLimit');
  });
});
