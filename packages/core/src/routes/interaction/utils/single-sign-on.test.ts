import { InteractionEvent, type SsoConnector } from '@logto/schemas';
import { createMockUtils } from '@logto/shared/esm';

import { mockSsoConnector, wellConfiguredSsoConnector } from '#src/__mocks__/sso.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import { OidcSsoConnector } from '#src/sso/OidcSsoConnector/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm } = createMockUtils(jest);

const getAuthorizationUrlMock = jest.fn();
const getIssuerMock = jest.fn();
const getUserInfoMock = jest.fn();
const findUserSsoIdentityBySsoIdentityIdMock = jest.fn();
const updateUserSsoIdentityMock = jest.fn();
const insertUserSsoIdentityMock = jest.fn();
const updateUserMock = jest.fn();
const findUserByEmailMock = jest.fn();
const insertUserMock = jest.fn();
const storeInteractionResultMock = jest.fn();

class MockOidcSsoConnector extends OidcSsoConnector {
  override getAuthorizationUrl = getAuthorizationUrlMock;
  override getIssuer = getIssuerMock;
  override getUserInfo = getUserInfoMock;
}

mockEsm('./interaction.js', () => ({
  storeInteractionResult: storeInteractionResultMock,
}));

jest
  .spyOn(ssoConnectorFactories.OIDC, 'constructor')
  .mockImplementation((data: SsoConnector) => new MockOidcSsoConnector(data));

const { getSsoAuthorizationUrl, getSsoAuthentication, handleSsoAuthentication } = await import(
  './single-sign-on.js'
);

describe('Single sign on util methods tests', () => {
  const mockContext: WithLogContext = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
  };

  const mockProvider = createMockProvider();
  const tenant = new MockTenant(
    mockProvider,
    {
      userSsoIdentities: {
        findUserSsoIdentityBySsoIdentityId: findUserSsoIdentityBySsoIdentityIdMock,
        updateById: updateUserSsoIdentityMock,
        insert: insertUserSsoIdentityMock,
      },
      users: {
        updateUserById: updateUserMock,
        findUserByEmail: findUserByEmailMock,
      },
    },
    undefined,
    {
      users: {
        insertUser: insertUserMock,
      },
    }
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSsoAuthorizationUrl tests', () => {
    it('should throw an error if the connector config is invalid', async () => {
      await expect(getSsoAuthorizationUrl(mockContext, tenant, mockSsoConnector)).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ status: 500, code: `connector.invalid_config` })
      );
    });

    it('should throw an error if OIDC connector is used without a proper payload', async () => {
      await expect(
        getSsoAuthorizationUrl(mockContext, tenant, wellConfiguredSsoConnector)
      ).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ status: 400, code: 'session.insufficient_info' })
      );
    });

    it('should call the connector getAuthorizationUrl method', async () => {
      getAuthorizationUrlMock.mockResolvedValueOnce('https://example.com');

      await expect(
        getSsoAuthorizationUrl(mockContext, tenant, wellConfiguredSsoConnector, {
          state: 'state',
          redirectUri: 'https://example.com',
        })
      ).resolves.toBe('https://example.com');
    });
  });

  describe('getSsoAuthentication tests', () => {
    it('should throw an error if the connector config is invalid', async () => {
      await expect(getSsoAuthentication(mockContext, tenant, mockSsoConnector)).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ status: 500, code: `connector.invalid_config` })
      );
    });

    it('should return the authentication result', async () => {
      getUserInfoMock.mockResolvedValueOnce({ id: 'id', email: 'email' });
      getIssuerMock.mockReturnValueOnce('https://example.com');

      const result = await getSsoAuthentication(mockContext, tenant, wellConfiguredSsoConnector);

      expect(getIssuerMock).toBeCalled();
      expect(getUserInfoMock).toBeCalled();

      expect(result).toStrictEqual({
        issuer: 'https://example.com',
        userInfo: { id: 'id', email: 'email' },
      });
    });
  });

  describe('handleSsoAuthentication tests', () => {
    const mockIssuer = 'https://example.com';
    const mockSsoUserInfo = {
      id: 'identityId',
      email: 'foo@logto.io',
      name: 'foo',
      avatar: 'https://example.com',
    };

    it('should signIn directly if the user is found', async () => {
      findUserSsoIdentityBySsoIdentityIdMock.mockResolvedValueOnce({
        id: 'ssoIdentityId',
        userId: 'foo',
        issuer: mockIssuer,
      });

      const accountId = await handleSsoAuthentication(
        mockContext,
        tenant,
        wellConfiguredSsoConnector,
        {
          issuer: mockIssuer,
          userInfo: mockSsoUserInfo,
        }
      );

      expect(accountId).toBe('foo');

      expect(findUserSsoIdentityBySsoIdentityIdMock).toBeCalledWith(mockIssuer, mockSsoUserInfo.id);

      // Should update the user sso identity
      expect(updateUserSsoIdentityMock).toBeCalledWith('ssoIdentityId', {
        detail: mockSsoUserInfo,
      });

      // Should update the user with syncProfile enabled
      expect(updateUserMock).toBeCalledWith('foo', {
        name: mockSsoUserInfo.name,
        avatar: mockSsoUserInfo.avatar,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        lastSignInAt: expect.any(Number),
      });
    });

    it('should signIn and link the sso identity if the user with the same email is found', async () => {
      findUserSsoIdentityBySsoIdentityIdMock.mockResolvedValueOnce(null);
      findUserByEmailMock.mockResolvedValueOnce({ id: 'foo', email: mockSsoUserInfo.email });

      const accountId = await handleSsoAuthentication(
        mockContext,
        tenant,
        {
          ...wellConfiguredSsoConnector,
          syncProfile: false,
        },
        {
          issuer: mockIssuer,
          userInfo: mockSsoUserInfo,
        }
      );

      expect(accountId).toBe('foo');

      expect(findUserByEmailMock).lastCalledWith(mockSsoUserInfo.email);

      // Should create new user sso identity
      expect(insertUserSsoIdentityMock).toBeCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        userId: 'foo',
        identityId: mockSsoUserInfo.id,
        issuer: mockIssuer,
        detail: mockSsoUserInfo,
      });

      // Should update the user with syncProfile enabled
      expect(updateUserMock).toBeCalledWith('foo', {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        lastSignInAt: expect.any(Number),
      });
    });

    it('should register if no related user account found', async () => {
      findUserSsoIdentityBySsoIdentityIdMock.mockResolvedValueOnce(null);
      findUserByEmailMock.mockResolvedValueOnce(null);
      insertUserMock.mockResolvedValueOnce({ id: 'foo' });

      const accountId = await handleSsoAuthentication(
        mockContext,
        tenant,
        wellConfiguredSsoConnector,
        {
          issuer: mockIssuer,
          userInfo: mockSsoUserInfo,
        }
      );

      expect(accountId).toBe('foo');

      // Should update the interaction session event to register
      expect(storeInteractionResultMock).toBeCalledWith(
        { event: InteractionEvent.Register },
        mockContext,
        mockProvider
      );

      // Should create new user
      expect(insertUserMock).toBeCalledWith(
        {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          id: expect.any(String),
          name: mockSsoUserInfo.name,
          avatar: mockSsoUserInfo.avatar,
          primaryEmail: mockSsoUserInfo.email,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          lastSignInAt: expect.any(Number),
        },
        []
      );

      // Should create new user sso identity
      expect(insertUserSsoIdentityMock).toBeCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        userId: 'foo',
        identityId: mockSsoUserInfo.id,
        issuer: mockIssuer,
        detail: mockSsoUserInfo,
      });
    });
  });
});
