import {
  DomainStatus,
  type CloudflareData,
  type Domain,
  type DomainResponse,
} from '@logto/schemas';

export const mockNanoIdForDomain = 'random_string';

export const mockCreatedAtForDomain = 1_650_969_000_000;

export const mockTenantIdForHook = 'fake_tenant';

export const mockDomainResponse: DomainResponse = {
  id: mockNanoIdForDomain,
  domain: 'logto.example.com',
  status: DomainStatus.PendingVerification,
  errorMessage: null,
  dnsRecords: [],
  createdAt: mockCreatedAtForDomain,
};

export const mockDomain: Domain = {
  ...mockDomainResponse,
  tenantId: mockTenantIdForHook,
  cloudflareData: null,
  updatedAt: mockCreatedAtForDomain,
  createdAt: mockCreatedAtForDomain,
};

export const mockHostnameId = 'mock-hostname-id';
export const mockTxtName = 'mock-txt-name';
export const mockTxtValue = 'mock-txt-value';
export const mockSslTxtName = 'mock-ssl-txt-name';
export const mockSslTxtValue = 'mock-ssl-txt-value';

export const mockCloudflareData: CloudflareData = {
  id: mockHostnameId,
  status: 'pending',
  ssl: {
    status: 'pending',
  },
};

export const mockCloudflareDataPendingSSL: CloudflareData = {
  id: `${mockHostnameId}-pending-ssl`,
  status: 'active',
  ssl: {
    status: 'pending',
  },
};

export const mockCloudflareDataActive: CloudflareData = {
  id: `${mockHostnameId}-active`,
  status: 'active',
  ssl: {
    status: 'active',
  },
};

export const mockDomainWithCloudflareData: Domain = {
  ...mockDomain,
  cloudflareData: mockCloudflareData,
};
