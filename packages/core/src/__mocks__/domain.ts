import { type Domain, type DomainResponse } from '@logto/schemas';

export const mockNanoIdForDomain = 'random_string';

export const mockCreatedAtForDomain = 1_650_969_000_000;

export const mockTenantIdForHook = 'fake_tenant';

export const mockDomainResponse: DomainResponse = {
  id: mockNanoIdForDomain,
  domain: 'logto.example.com',
  status: 'pending',
  errorMessage: null,
  dnsRecords: [],
};

export const mockDomain: Domain = {
  ...mockDomainResponse,
  tenantId: mockTenantIdForHook,
  cloudflareData: null,
  updatedAt: mockCreatedAtForDomain,
  createdAt: mockCreatedAtForDomain,
};
