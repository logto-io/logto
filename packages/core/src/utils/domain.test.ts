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
        isDevelopmentFeatureEnabled: false,
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
        isDevelopmentFeatureEnabled: true,
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

  it('limits tenants without dev features to a single custom domain', async () => {
    const { quotaLibrary, guardTenantUsageByKey } = createQuotaLibraryMock();

    await expect(
      assertCustomDomainLimit({
        isPrivateRegionFeature: false,
        isDevelopmentFeatureEnabled: false,
        quotaLibrary,
        existingDomainCount: 0,
      })
    ).resolves.toBeUndefined();

    await expect(
      assertCustomDomainLimit({
        isPrivateRegionFeature: false,
        isDevelopmentFeatureEnabled: false,
        quotaLibrary,
        existingDomainCount: 1,
      })
    ).rejects.toMatchError(
      new RequestError({
        code: 'domain.limit_to_one_domain',
        status: 422,
      })
    );

    expect(guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('delegates to quota guard when dev features are enabled', async () => {
    const { quotaLibrary, guardTenantUsageByKey } = createQuotaLibraryMock();

    await expect(
      assertCustomDomainLimit({
        isPrivateRegionFeature: false,
        isDevelopmentFeatureEnabled: true,
        quotaLibrary,
        existingDomainCount: 5,
      })
    ).resolves.toBeUndefined();

    expect(guardTenantUsageByKey).toHaveBeenCalledTimes(1);
    expect(guardTenantUsageByKey).toHaveBeenCalledWith('customDomainsLimit');
  });
});
