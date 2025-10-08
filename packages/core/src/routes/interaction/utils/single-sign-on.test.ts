/* eslint-disable max-lines */
import { createMockUtils } from '@logto/shared/esm';
import type { Provider } from 'oidc-provider';
import Sinon from 'sinon';

import {
  mockSsoConnector,
  wellConfiguredSsoConnector,
  mockSamlSsoConnector,
} from '#src/__mocks__/sso.js';
import { EnvSet, getTenantEndpoint } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import { type WithLogContext } from '#src/middleware/koa-audit-log.js';
import { type WithInteractionDetailsContext } from '#src/middleware/koa-interaction-details.js';
import { OidcSsoConnector } from '#src/sso/OidcSsoConnector/index.js';
import { ssoConnectorFactories } from '#src/sso/index.js';
import { type SingleSignOnConnectorData } from '#src/sso/types/connector.js';
import { createMockLogContext } from '#src/test-utils/koa-audit-log.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import { idpInitiatedSamlSsoSessionCookieName } from '../../../constants/index.js';
import { SamlSsoConnector } from '../../../sso/SamlSsoConnector/index.js';
import { type WithInteractionHooksContext } from '../middleware/koa-interaction-hooks.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

const getAuthorizationUrlMock = jest.fn();
const getIssuerMock = jest.fn();
const getUserInfoMock = jest.fn();
const findUserSsoIdentityBySsoIdentityIdMock = jest.fn();
const updateUserSsoIdentityMock = jest.fn();
const insertUserSsoIdentityMock = jest.fn();
const updateUserMock = jest.fn();
const findUserByEmailMock = jest.fn();
const insertUserMock = jest.fn().mockResolvedValue([{ id: 'foo' }, { organizations: [] }]);
const generateUserIdMock = jest.fn().mockResolvedValue('foo');
const getAvailableSsoConnectorsMock = jest.fn();

const findIdpInitiatedSamlSsoSessionMock = jest.fn();
const deleteIdpInitiatedSamlSsoSessionMock = jest.fn();

class MockOidcSsoConnector extends OidcSsoConnector {
  override getAuthorizationUrl = getAuthorizationUrlMock;
  override getIssuer = getIssuerMock;
  override getUserInfo = getUserInfoMock;
}

class MockSamlSsoConnector extends SamlSsoConnector {
  override getAuthorizationUrl = getAuthorizationUrlMock;
  override getIssuer = getIssuerMock;
  override getUserInfo = getUserInfoMock;
}

mockEsm('./interaction.js', () => ({
  storeInteractionResult: jest.fn(),
}));

const {
  assignSingleSignOnSessionResult: assignSingleSignOnSessionResultMock,
  getSingleSignOnSessionResult: getSingleSignOnSessionResultMock,
  assignSingleSignOnAuthenticationResult: assignSingleSignOnAuthenticationResultMock,
} = await mockEsmWithActual('./single-sign-on-session.js', () => ({
  assignSingleSignOnSessionResult: jest.fn(),
  getSingleSignOnSessionResult: jest.fn(),
  assignSingleSignOnAuthenticationResult: jest.fn(),
}));

jest
  .spyOn(ssoConnectorFactories.OIDC, 'constructor')
  .mockImplementation((data: SingleSignOnConnectorData) => new MockOidcSsoConnector(data));
jest
  .spyOn(ssoConnectorFactories.SAML, 'constructor')
  .mockImplementation(
    (data: SingleSignOnConnectorData) =>
      new MockSamlSsoConnector(data, getTenantEndpoint('tenantId', EnvSet.values))
  );

const {
  getSsoAuthorizationUrl,
  getSsoAuthentication,
  handleSsoAuthentication,
  registerWithSsoAuthentication,
} = await import('./single-sign-on.js');

describe('Single sign on util methods tests', () => {
  const mockContext = {
    ...createContextWithRouteParameters(),
    ...createMockLogContext(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: { jti: 'foo' } as Awaited<ReturnType<Provider['interactionDetails']>>,
    assignInteractionHookResult: jest.fn(),
    appendDataHookContext: jest.fn(),
  } satisfies WithInteractionHooksContext<WithLogContext<WithInteractionDetailsContext>>;

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
      ssoConnectors: {
        findIdpInitiatedSamlSsoSessionById: findIdpInitiatedSamlSsoSessionMock,
        deleteIdpInitiatedSamlSsoSessionById: deleteIdpInitiatedSamlSsoSessionMock,
      },
    },
    undefined,
    {
      users: {
        insertUser: insertUserMock,
        generateUserId: generateUserIdMock,
      },
      ssoConnectors: {
        getAvailableSsoConnectors: getAvailableSsoConnectorsMock,
      },
    }
  );

  const mockIssuer = 'https://example.com';
  const mockSsoUserInfo = {
    id: 'identityId',
    email: 'foo@logto.io',
    name: 'foo',
    avatar: 'https://example.com',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSsoAuthorizationUrl tests', () => {
    const payload = {
      state: 'state',
      redirectUri: 'https://example.com',
    };

    it('should throw an error if the connector config is invalid', async () => {
      await expect(
        getSsoAuthorizationUrl(mockContext, tenant, mockSsoConnector, payload)
      ).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ status: 500, code: `connector.invalid_config` })
      );
    });

    it('should call the connector getAuthorizationUrl method', async () => {
      getAuthorizationUrlMock.mockResolvedValueOnce('https://example.com');

      await expect(
        getSsoAuthorizationUrl(mockContext, tenant, wellConfiguredSsoConnector, payload)
      ).resolves.toBe('https://example.com');
    });
  });

  describe('getSsoAuthentication tests', () => {
    it('should throw an error if the connector config is invalid', async () => {
      getSingleSignOnSessionResultMock.mockRejectedValueOnce(
        new RequestError('session.connector_validation_session_not_found')
      );

      await expect(getSsoAuthentication(mockContext, tenant, mockSsoConnector, {})).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({
          status: 400,
          code: `session.connector_validation_session_not_found`,
        })
      );
    });

    it('should throw an error if the connector config is invalid', async () => {
      await expect(getSsoAuthentication(mockContext, tenant, mockSsoConnector, {})).rejects.toThrow(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        expect.objectContaining({ status: 500, code: `connector.invalid_config` })
      );
    });

    it('should return the authentication result', async () => {
      const session = {
        connectorId: wellConfiguredSsoConnector.id,
        jti: 'jti',
        redirectUri: 'https://example.com',
        state: 'state',
      };

      const payload = {
        code: 'code',
      };

      getSingleSignOnSessionResultMock.mockResolvedValueOnce(session);
      getUserInfoMock.mockResolvedValueOnce({
        userInfo: { id: 'id', email: 'email' },
      });
      getIssuerMock.mockReturnValueOnce('https://example.com');

      const result = await getSsoAuthentication(
        mockContext,
        tenant,
        wellConfiguredSsoConnector,
        payload
      );

      expect(getIssuerMock).toBeCalled();
      expect(getUserInfoMock).toBeCalledWith(session, payload);

      expect(result).toStrictEqual({
        issuer: 'https://example.com',
        userInfo: { id: 'id', email: 'email' },
        encryptedTokenSet: undefined,
      });

      expect(assignSingleSignOnAuthenticationResultMock).toBeCalledWith(mockContext, mockProvider, {
        connectorId: wellConfiguredSsoConnector.id,
        ...result,
      });
    });
  });

  describe('handleSsoAuthentication tests', () => {
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
        ssoConnectorId: wellConfiguredSsoConnector.id,
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

    it('should throw if no related user account found', async () => {
      findUserSsoIdentityBySsoIdentityIdMock.mockResolvedValueOnce(null);
      findUserByEmailMock.mockResolvedValueOnce(null);

      await expect(async () =>
        handleSsoAuthentication(mockContext, tenant, mockSsoConnector, {
          issuer: mockIssuer,
          userInfo: mockSsoUserInfo,
        })
      ).rejects.toMatchObject(
        new RequestError(
          {
            code: 'user.identity_not_exist',
            status: 422,
          },
          {}
        )
      );
    });
  });

  describe('registerWithSsoAuthentication tests', () => {
    it('should register if no related user account found', async () => {
      insertUserMock.mockResolvedValueOnce([{ id: 'foo' }, { organizations: [] }]);

      const { id } = await registerWithSsoAuthentication(mockContext, tenant, {
        connectorId: wellConfiguredSsoConnector.id,
        issuer: mockIssuer,
        userInfo: mockSsoUserInfo,
      });

      expect(id).toBe('foo');

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
        { isInteractive: true }
      );

      // Should create new user sso identity
      expect(insertUserSsoIdentityMock).toBeCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        userId: 'foo',
        ssoConnectorId: wellConfiguredSsoConnector.id,
        identityId: mockSsoUserInfo.id,
        issuer: mockIssuer,
        detail: mockSsoUserInfo,
      });
    });
  });

  describe('getSsoAuthorizationUrl tests with idp initiated sso session', () => {
    const stub = Sinon.stub(EnvSet, 'values').value({
      ...EnvSet.values,
      isDevFeaturesEnabled: true,
    });

    const payload = {
      state: 'state',
      redirectUri: 'https://example.com',
    };

    const samlSsoSessionId = 'samlSsoSessionId';
    const samlAuthorizationUrl = 'https://saml-connector/callback';

    const mockContextWithIdpInitiatedSsoSession = {
      ...mockContext,
      ...createContextWithRouteParameters({
        cookies: {
          [idpInitiatedSamlSsoSessionCookieName]: samlSsoSessionId,
        },
      }),
    };

    afterAll(() => {
      stub.restore();
    });

    beforeEach(() => {
      getAuthorizationUrlMock.mockResolvedValueOnce(samlAuthorizationUrl);
    });

    it('should not check idp initiated sso session if the connector is not SAML', async () => {
      await expect(
        getSsoAuthorizationUrl(
          mockContextWithIdpInitiatedSsoSession,
          tenant,
          wellConfiguredSsoConnector,
          payload
        )
      ).resolves.toBe(samlAuthorizationUrl);

      expect(findIdpInitiatedSamlSsoSessionMock).not.toHaveBeenCalled();
    });

    it('should not check idp initiated sso session if the session cookie is not found', async () => {
      await expect(
        getSsoAuthorizationUrl(mockContext, tenant, mockSamlSsoConnector, payload)
      ).resolves.toBe(samlAuthorizationUrl);

      expect(findIdpInitiatedSamlSsoSessionMock).not.toHaveBeenCalled();
      expect(deleteIdpInitiatedSamlSsoSessionMock).not.toHaveBeenCalled();
    });

    it('should redirect to the connector authorization uri  if the idp initiated sso session is not found', async () => {
      findIdpInitiatedSamlSsoSessionMock.mockResolvedValueOnce(null);

      await expect(
        getSsoAuthorizationUrl(
          mockContextWithIdpInitiatedSsoSession,
          tenant,
          mockSamlSsoConnector,
          payload
        )
      ).resolves.toBe(samlAuthorizationUrl);

      expect(findIdpInitiatedSamlSsoSessionMock).toBeCalledWith(samlSsoSessionId);
    });

    it('should redirect to the connector authorization uri  if the idp initiated sso session connectorId mismatch', async () => {
      findIdpInitiatedSamlSsoSessionMock.mockResolvedValueOnce({
        id: samlSsoSessionId,
        connectorId: 'foo',
      });

      await expect(
        getSsoAuthorizationUrl(
          mockContextWithIdpInitiatedSsoSession,
          tenant,
          mockSamlSsoConnector,
          payload
        )
      ).resolves.toBe(samlAuthorizationUrl);

      expect(findIdpInitiatedSamlSsoSessionMock).toBeCalledWith(samlSsoSessionId);
      expect(deleteIdpInitiatedSamlSsoSessionMock).not.toHaveBeenCalled();
    });

    it('should redirect to the connector authorization uri  if the idp initiated sso session is expired', async () => {
      findIdpInitiatedSamlSsoSessionMock.mockResolvedValueOnce({
        id: samlSsoSessionId,
        connectorId: mockSamlSsoConnector.id,
        expiresAt: Date.now() - 1000 * 60 * 11,
      });

      await expect(
        getSsoAuthorizationUrl(
          mockContextWithIdpInitiatedSsoSession,
          tenant,
          mockSamlSsoConnector,
          payload
        )
      ).resolves.toBe(samlAuthorizationUrl);

      expect(findIdpInitiatedSamlSsoSessionMock).toBeCalledWith(samlSsoSessionId);

      // Should delete the idp initiated sso session
      expect(mockContextWithIdpInitiatedSsoSession.cookies.set).toBeCalledWith(
        idpInitiatedSamlSsoSessionCookieName,
        '',
        {
          httpOnly: true,
          expires: new Date(0),
        }
      );
      expect(deleteIdpInitiatedSamlSsoSessionMock).toBeCalledWith(samlSsoSessionId);
    });

    it('should assign the user info and redirect to the SSO callback uri if the idp initiated sso session is valid', async () => {
      findIdpInitiatedSamlSsoSessionMock.mockResolvedValueOnce({
        id: samlSsoSessionId,
        connectorId: mockSamlSsoConnector.id,
        expiresAt: Date.now() + 1000 * 60 * 10,
        assertionContent: {
          nameID: mockSsoUserInfo.id,
          attributes: {
            email: mockSsoUserInfo.email,
            name: mockSsoUserInfo.name,
            avatar: mockSsoUserInfo.avatar,
          },
        },
      });

      await expect(
        getSsoAuthorizationUrl(
          mockContextWithIdpInitiatedSsoSession,
          tenant,
          mockSamlSsoConnector,
          payload
        )
      ).resolves.toBe(`${payload.redirectUri}/?state=${payload.state}`);

      expect(findIdpInitiatedSamlSsoSessionMock).toBeCalledWith(samlSsoSessionId);

      expect(assignSingleSignOnSessionResultMock).toBeCalledWith(
        mockContextWithIdpInitiatedSsoSession,
        mockProvider,
        {
          connectorId: mockSamlSsoConnector.id,
          ...payload,
          userInfo: mockSsoUserInfo,
        }
      );

      // Should delete the idp initiated sso session
      expect(mockContextWithIdpInitiatedSsoSession.cookies.set).toBeCalledWith(
        idpInitiatedSamlSsoSessionCookieName,
        '',
        {
          httpOnly: true,
          expires: new Date(0),
        }
      );
      expect(deleteIdpInitiatedSamlSsoSessionMock).toBeCalledWith(samlSsoSessionId);
    });
  });
});
/* eslint-enable max-lines */
