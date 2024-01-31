import { DomainStatus } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockCloudflareData, mockProtectedApplication } from '#src/__mocks__/index.js';
import { mockIdGenerators } from '#src/test-utils/nanoid.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const mockDomain = 'app.example.com';
const protectedAppSignInCallbackUrl = 'sign-in-callback';

const updateApplicationById = jest.fn();
const findApplicationById = jest.fn(async () => mockProtectedApplication);

const mockDomainResponse = {
  domain: mockDomain,
  cloudflareData: null,
  status: DomainStatus.PendingVerification,
  errorMessage: null,
  dnsRecords: [
    {
      type: 'CNAME',
      name: mockDomain,
      value: 'origin',
    },
  ],
};
const addDomainToRemote = jest.fn(async () => mockDomainResponse);
const syncAppCustomDomainStatus = jest.fn(async () => ({
  ...mockProtectedApplication,
  protectedAppMetadata: {
    ...mockProtectedApplication.protectedAppMetadata,
    customDomains: [mockDomainResponse],
  },
}));
const syncAppConfigsToRemote = jest.fn();
const deleteDomainFromRemote = jest.fn();
const deleteRemoteAppConfigs = jest.fn();

await mockIdGenerators();

const tenantContext = new MockTenant(
  undefined,
  {
    applications: {
      findApplicationById,
      updateApplicationById,
    },
  },
  undefined,
  {
    protectedApps: {
      addDomainToRemote,
      syncAppCustomDomainStatus,
      syncAppConfigsToRemote,
      deleteDomainFromRemote,
      deleteRemoteAppConfigs,
    },
    applications: { validateProtectedApplicationById: jest.fn() },
  }
);

const { createRequester } = await import('#src/utils/test-utils.js');
const applicationProtectedAppMetadataRoutes = await pickDefault(
  import('./application-protected-app-metadata.js')
);

describe('application protected app metadata routes', () => {
  afterEach(() => {
    updateApplicationById.mockClear();
  });

  const requester = createRequester({
    authedRoutes: applicationProtectedAppMetadataRoutes,
    tenantContext,
  });

  describe('GET /applications/:applicationId/protected-app-metadata/custom-domains', () => {
    it('should return domain list', async () => {
      const response = await requester.get(
        `/applications/${mockProtectedApplication.id}/protected-app-metadata/custom-domains`
      );
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([mockDomainResponse]);
    });
  });

  describe('POST /applications/:applicationId/protected-app-metadata/custom-domains', () => {
    it('should return 201 and update OIDC metadata and sync site configs', async () => {
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
        oidcClientMetadata: {
          postLogoutRedirectUris: [
            `https://${mockProtectedApplication.protectedAppMetadata.host}`,
            `https://${mockDomain}`,
          ],
          redirectUris: [
            `https://${mockProtectedApplication.protectedAppMetadata.host}/${protectedAppSignInCallbackUrl}`,
            `https://${mockDomain}/${protectedAppSignInCallbackUrl}`,
          ],
        },
      });
      expect(syncAppConfigsToRemote).toHaveBeenCalledWith(mockProtectedApplication.id);
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
      expect(response.status).toEqual(422);
    });
  });

  describe('DELETE /applications/:applicationId/protected-app-metadata/custom-domains/:domain', () => {
    it('should update application, delete remote domain, and delete site configs', async () => {
      findApplicationById.mockResolvedValueOnce({
        ...mockProtectedApplication,
        protectedAppMetadata: {
          ...mockProtectedApplication.protectedAppMetadata,
          customDomains: [
            {
              ...mockDomainResponse,
              cloudflareData: mockCloudflareData,
            },
          ],
        },
      });
      const response = await requester.delete(
        `/applications/${mockProtectedApplication.id}/protected-app-metadata/custom-domains/${mockDomainResponse.domain}`
      );
      expect(response.status).toEqual(204);
      expect(updateApplicationById).toHaveBeenCalledWith(mockProtectedApplication.id, {
        protectedAppMetadata: {
          ...mockProtectedApplication.protectedAppMetadata,
          customDomains: [],
        },
        oidcClientMetadata: {
          postLogoutRedirectUris: [`https://${mockProtectedApplication.protectedAppMetadata.host}`],
          redirectUris: [
            `https://${mockProtectedApplication.protectedAppMetadata.host}/${protectedAppSignInCallbackUrl}`,
          ],
        },
      });
      expect(deleteDomainFromRemote).toHaveBeenCalledWith(mockCloudflareData.id);
      expect(deleteRemoteAppConfigs).toHaveBeenCalledWith(mockDomainResponse.domain);
    });

    it('throw when domain exists', async () => {
      findApplicationById.mockResolvedValueOnce({
        ...mockProtectedApplication,
        protectedAppMetadata: {
          ...mockProtectedApplication.protectedAppMetadata,
          customDomains: [mockDomainResponse],
        },
      });
      const response = await requester.delete(
        `/applications/${mockProtectedApplication.id}/protected-app-metadata/custom-domains/unexists.com`
      );
      expect(response.status).toEqual(404);
    });
  });
});
