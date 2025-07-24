import { type EnterpriseSsoTokenSetSecret, SecretType } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockUser } from '#src/__mocks__/user.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { desensitizeTokenSetSecret } from '#src/utils/secret-encryption.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const mockFindUserById = jest.fn(async () => mockUser);
const mockFindUserSsoIdentities = jest.fn();
const mockFindEnterpriseSsoTokenSetSecret = jest.fn();

const mockQueries = {
  users: {
    findUserById: mockFindUserById,
  },
  secrets: {
    findEnterpriseSsoTokenSetSecretByUserIdAndConnectorId: mockFindEnterpriseSsoTokenSetSecret,
  },
};

const mockLibraries = {
  users: {
    findUserSsoIdentities: mockFindUserSsoIdentities,
  },
};

const enterpriseSsoRoutes = await pickDefault(import('./enterprise-sso.js'));

describe('Enterprise SSO Routes', () => {
  const tenantContext = new MockTenant(undefined, mockQueries, undefined, mockLibraries);
  const mockSsoConnectorId = 'ssoConnectorId';
  const mockSsoIdentity = {
    id: 'mockId',
    userId: mockUser.id,
    tenantId: tenantContext.id,
    ssoConnectorId: mockSsoConnectorId,
    identityId: 'identityId',
    issuer: 'issuer',
    detail: {},
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockTokenSetSecret = {
    tenantId: tenantContext.id,
    id: 'secretId',
    userId: mockUser.id,
    type: SecretType.FederatedTokenSet,
    // Other fields as necessary
    createdAt: Date.now(),
    updatedAt: Date.now(),
    iv: Buffer.from(''),
    authTag: Buffer.from(''),
    ciphertext: Buffer.from(''),
    encryptedDek: Buffer.from(''),
    metadata: {
      scope: 'foo bar',
      hasRefreshToken: false,
    },
    ssoConnectorId: mockSsoConnectorId,
    issuer: mockSsoIdentity.issuer,
    identityId: mockSsoIdentity.identityId,
  } satisfies EnterpriseSsoTokenSetSecret;

  const userRequest = createRequester({
    authedRoutes: enterpriseSsoRoutes,
    tenantContext,
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should throw 404 if the sso identity does not exist', async () => {
    mockFindUserSsoIdentities.mockResolvedValueOnce([
      {
        ...mockSsoIdentity,
        ssoConnectorId: 'dummySsoConnectorId',
      },
    ]);

    const response = await userRequest.get(
      `/users/${mockUser.id}/sso-identities/${mockSsoConnectorId}`
    );

    expect(mockFindUserById).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindUserSsoIdentities).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindEnterpriseSsoTokenSetSecret).not.toHaveBeenCalled();

    expect(response.status).toBe(404);
  });

  it('should return the enterprise SSO identity only', async () => {
    mockFindUserSsoIdentities.mockResolvedValueOnce([mockSsoIdentity]);
    mockFindEnterpriseSsoTokenSetSecret.mockResolvedValueOnce(null);

    const response = await userRequest.get(
      `/users/${mockUser.id}/sso-identities/${mockSsoConnectorId}`
    );

    expect(mockFindUserById).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindUserSsoIdentities).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindEnterpriseSsoTokenSetSecret).not.toBeCalled();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ssoIdentity: mockSsoIdentity,
    });
  });

  it('should return the enterprise SSO identity properly only if token secret is not found', async () => {
    mockFindUserSsoIdentities.mockResolvedValueOnce([mockSsoIdentity]);
    mockFindEnterpriseSsoTokenSetSecret.mockResolvedValueOnce(null);

    const response = await userRequest.get(
      `/users/${mockUser.id}/sso-identities/${mockSsoConnectorId}?includeTokenSecret=true`
    );

    expect(mockFindUserById).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindUserSsoIdentities).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindEnterpriseSsoTokenSetSecret).toHaveBeenCalledWith(
      mockUser.id,
      mockSsoConnectorId
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ssoIdentity: mockSsoIdentity,
    });
  });

  it('should return the enterprise SSO identity with token set secret', async () => {
    mockFindEnterpriseSsoTokenSetSecret.mockResolvedValueOnce(mockTokenSetSecret);
    mockFindUserSsoIdentities.mockResolvedValueOnce([mockSsoIdentity]);

    const response = await userRequest.get(
      `/users/${mockUser.id}/sso-identities/${mockSsoConnectorId}?includeTokenSecret=true`
    );
    expect(mockFindUserById).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindUserSsoIdentities).toHaveBeenCalledWith(mockUser.id);
    expect(mockFindEnterpriseSsoTokenSetSecret).toHaveBeenCalledWith(
      mockUser.id,
      mockSsoConnectorId
    );
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ssoIdentity: mockSsoIdentity,
      tokenSecret: desensitizeTokenSetSecret(mockTokenSetSecret),
    });
  });
});
