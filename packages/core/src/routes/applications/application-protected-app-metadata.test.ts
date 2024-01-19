import { type Application, DomainStatus } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { type Nullable } from '@silverhand/essentials';

import { mockProtectedApplication } from '#src/__mocks__/index.js';
import { mockIdGenerators } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const mockDomain = 'app.example.com';

const updateApplicationById = jest.fn();
const findApplicationById = jest.fn(async () => mockProtectedApplication);
const findApplicationByProtectedAppCustomDomain = jest.fn(
  async (): Promise<Nullable<Application>> => null
);

const mockDomainResponse = {
  domain: mockDomain,
  cloudflareData: null,
  status: DomainStatus.PendingVerification,
  error: null,
  dnsRecords: [
    {
      type: 'CNAME',
      name: mockDomain,
      value: 'origin',
    },
  ],
};
const addDomainToRemote = jest.fn(async () => mockDomainResponse);

await mockIdGenerators();

const tenantContext = new MockTenant(
  undefined,
  {
    applications: {
      findApplicationById,
      updateApplicationById,
      findApplicationByProtectedAppCustomDomain,
    },
  },
  undefined,
  {
    protectedApps: { addDomainToRemote },
    applications: { validateProtectedApplicationById: jest.fn() },
  }
);

const { createRequester } = await import('#src/utils/test-utils.js');
const applicationProtectedAppMetadataRoutes = await pickDefault(
  import('./application-protected-app-metadata.js')
);

describe('application protected app metadata routes', () => {
  const requester = createRequester({
    authedRoutes: applicationProtectedAppMetadataRoutes,
    tenantContext,
  });

  describe('POST /applications/:applicationId/protected-app-metadata/custom-domains', () => {
    it('should return 201', async () => {
      const response = await requester
        .post(`/applications/${mockProtectedApplication.id}/protected-app-metadata/custom-domains`)
        .send({
          domain: mockDomain,
        });
      expect(response.status).toEqual(201);
      expect(updateApplicationById).toHaveBeenCalledWith(mockProtectedApplication.id, {
        protectedAppMetadata: {
          ...mockProtectedApplication.protectedAppMetadata,
          customDomains: [mockDomainResponse],
        },
      });
    });

    it('throw when domain exists', async () => {
      findApplicationById.mockResolvedValueOnce({
        ...mockProtectedApplication,
        protectedAppMetadata: {
          ...mockProtectedApplication.protectedAppMetadata,
          customDomains: [mockDomainResponse],
        },
      });
      const response = await requester
        .post(`/applications/asdf/protected-app-metadata/custom-domains`)
        .send({
          domain: mockDomain,
        });
      expect(response.status).toEqual(400);
    });

    it('throw when the domain is already in use', async () => {
      findApplicationByProtectedAppCustomDomain.mockResolvedValueOnce(mockProtectedApplication);
      const response = await requester
        .post(`/applications/asdf/protected-app-metadata/custom-domains`)
        .send({
          domain: mockDomain,
        });
      expect(response.status).toEqual(422);
    });
  });
});
