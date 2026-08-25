import { ReservedScope, UserScope } from '@logto/core-kit';
import { errors } from 'oidc-provider';

import type Queries from '#src/tenants/Queries.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';

import {
  buildResourceScopesToReject,
  findStaleOidcScopes,
  revalidateConsentClient,
} from './utils.js';

describe('findStaleOidcScopes', () => {
  const clientScope = [ReservedScope.OpenId, ReservedScope.OfflineAccess, UserScope.Profile].join(
    ' '
  );

  it('should return nothing when every requested OIDC scope is still allowed', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Profile}`,
        missingOIDCScope: [UserScope.Profile],
      })
    ).toEqual([]);
  });

  it('should flag a requested user scope the current client scope no longer allows', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Profile} ${UserScope.Email}`,
        missingOIDCScope: [UserScope.Profile],
      })
    ).toEqual([UserScope.Email]);
  });

  it('should flag a snapshot scope even when it no longer derives from the scope parameter', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: ReservedScope.OpenId,
        missingOIDCScope: [UserScope.Email],
      })
    ).toEqual([UserScope.Email]);
  });

  it('should ignore resource scope names in the scope parameter', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${ReservedScope.OpenId} read:resource`,
        missingOIDCScope: [],
      })
    ).toEqual([]);
  });

  it('should validate the snapshot alone when the scope parameter is not a string', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: undefined,
        missingOIDCScope: [UserScope.Profile, UserScope.Email],
      })
    ).toEqual([UserScope.Email]);
  });

  it('should deduplicate scopes present in both the request and the snapshot', () => {
    expect(
      findStaleOidcScopes({
        clientScope,
        requestedScope: `${UserScope.Email} ${UserScope.Organizations}`,
        missingOIDCScope: [UserScope.Email, UserScope.Organizations],
      })
    ).toEqual([UserScope.Email, UserScope.Organizations]);
  });
});

describe('buildResourceScopesToReject', () => {
  it('should reject the remainder of a partially granted group', () => {
    expect(
      buildResourceScopesToReject(
        { 'https://api.example.com': ['read', 'write'] },
        { 'https://api.example.com': ['read'] },
        false
      )
    ).toEqual({ 'https://api.example.com': ['write'] });
  });

  it('should reject the whole group for a CIMD consent submitted without an organization', () => {
    // The group's scopes are reachable through organization roles only, so the rebuild grants nothing for it.
    expect(
      buildResourceScopesToReject({ 'https://api.example.com': ['read', 'write'] }, {}, true)
    ).toEqual({ 'https://api.example.com': ['read', 'write'] });
  });

  it('should reject the whole group for a CIMD consent when the selected organization contributes none of the requested scopes', () => {
    expect(
      buildResourceScopesToReject(
        { 'https://api.example.com': ['read'] },
        { 'urn:logto:resource:organizations': ['org:read'] },
        true
      )
    ).toEqual({ 'https://api.example.com': ['read'] });
  });

  it('should leave an ungrantable group unencountered for a registered client', () => {
    expect(buildResourceScopesToReject({ 'https://api.example.com': ['read'] }, {}, false)).toEqual(
      {
        'https://api.example.com': [],
      }
    );
  });
});

describe('revalidateConsentClient', () => {
  const clientScope = [ReservedScope.OpenId, ReservedScope.OfflineAccess, UserScope.Profile].join(
    ' '
  );
  const cimdClientId = 'https://client.example.com/metadata.json';
  const redirectUri = 'https://client.example.com/callback';

  it('should reject a CIMD submission whose redirect uri the current document no longer allows, without consulting the application registry', async () => {
    const findApplicationById = jest.fn().mockRejectedValue(new Error('should not be called'));
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => false }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: { applications: { findApplicationById } } as unknown as Queries,
        applicationId: cimdClientId,
        cimd: true,
        redirectUri,
        requestedScope: ReservedScope.OpenId,
        missingOIDCScope: [],
      })
    ).rejects.toThrow(errors.InvalidRedirectUri);

    expect(findApplicationById).not.toHaveBeenCalled();
  });

  it('should reject a CIMD submission when the tenant ceiling no longer allows a snapshot scope', async () => {
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => true }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: { applications: { findApplicationById: jest.fn() } } as unknown as Queries,
        applicationId: cimdClientId,
        cimd: true,
        redirectUri,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Email}`,
        missingOIDCScope: [UserScope.Email],
      })
    ).rejects.toThrow(errors.InvalidScope);
  });

  it('should pass a CIMD submission whose redirect uri and scopes are still allowed', async () => {
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => true }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: { applications: { findApplicationById: jest.fn() } } as unknown as Queries,
        applicationId: cimdClientId,
        cimd: true,
        redirectUri,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Profile}`,
        missingOIDCScope: [UserScope.Profile],
      })
    ).resolves.toBeUndefined();
  });

  it('should skip revalidation for a first-party application', async () => {
    const find = jest.fn();
    const provider = createMockProvider(undefined, undefined, { find });

    await expect(
      revalidateConsentClient({
        provider,
        queries: {
          applications: {
            findApplicationById: jest.fn().mockResolvedValue({ isThirdParty: false }),
          },
        } as unknown as Queries,
        applicationId: 'registered-app-id',
        cimd: false,
        redirectUri,
        requestedScope: ReservedScope.OpenId,
        missingOIDCScope: [],
      })
    ).resolves.toBeUndefined();

    expect(find).not.toHaveBeenCalled();
  });

  it('should reject a third-party application submission when a snapshot scope is no longer allowed', async () => {
    const provider = createMockProvider(undefined, undefined, {
      find: async () => ({ scope: clientScope, redirectUriAllowed: () => true }),
    });

    await expect(
      revalidateConsentClient({
        provider,
        queries: {
          applications: {
            findApplicationById: jest.fn().mockResolvedValue({ isThirdParty: true }),
          },
        } as unknown as Queries,
        applicationId: 'registered-app-id',
        cimd: false,
        redirectUri,
        requestedScope: `${ReservedScope.OpenId} ${UserScope.Email}`,
        missingOIDCScope: [UserScope.Email],
      })
    ).rejects.toThrow(errors.InvalidScope);
  });
});
