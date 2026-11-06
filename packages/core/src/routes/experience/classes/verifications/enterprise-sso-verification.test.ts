import { VerificationType } from '@logto/schemas';

import { wellConfiguredSsoConnector } from '#src/__mocks__/sso.js';
import { mockUser } from '#src/__mocks__/user.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockTenant } from '#src/test-utils/tenant.js';

import { EnterpriseSsoVerification } from './enterprise-sso-verification.js';

const { jest } = import.meta;

const findUserByEmail = jest.fn();
const findUserById = jest.fn();
const findUserSsoIdentityBySsoIdentityId = jest.fn();
const getSsoConnectorById = jest.fn();

const tenant = new MockTenant(
  undefined,
  {
    users: { findUserByEmail, findUserById },
    userSsoIdentities: { findUserSsoIdentityBySsoIdentityId },
  },
  undefined,
  { ssoConnectors: { getSsoConnectorById } }
);

const createVerification = (email: string) =>
  new EnterpriseSsoVerification(tenant.libraries, tenant.queries, {
    id: 'sso-verification-id',
    type: VerificationType.EnterpriseSso,
    connectorId: wellConfiguredSsoConnector.id,
    enterpriseSsoUserInfo: { id: 'sso-user-id', email },
    issuer: 'https://foo.com',
  });

describe('EnterpriseSsoVerification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    findUserByEmail.mockResolvedValue(mockUser);
    getSsoConnectorById.mockResolvedValue(wellConfiguredSsoConnector);
  });

  describe('identifyRelatedUser', () => {
    it('links the account whose email is on a connector domain', async () => {
      getSsoConnectorById.mockResolvedValueOnce({
        ...wellConfiguredSsoConnector,
        domains: ['other.com', 'foo.com'],
      });

      await expect(createVerification('bar@foo.com').identifyRelatedUser()).resolves.toBe(mockUser);
      expect(findUserByEmail).toHaveBeenCalledWith('bar@foo.com');
    });

    it('matches the email domain case-insensitively', async () => {
      getSsoConnectorById.mockResolvedValueOnce({
        ...wellConfiguredSsoConnector,
        domains: ['FOO.com'],
      });

      await expect(createVerification('Bar@Foo.COM').identifyRelatedUser()).resolves.toBe(mockUser);
      expect(findUserByEmail).toHaveBeenCalledWith('Bar@Foo.COM');
    });

    it.each([
      { email: 'bar@other.com', domains: ['foo.com'] },
      { email: 'bar@sub.foo.com', domains: ['foo.com'] },
      { email: 'bar@foo.com', domains: [] },
      { email: 'foo.com', domains: ['foo.com'] },
    ])('does not link $email for connector domains $domains', async ({ email, domains }) => {
      getSsoConnectorById.mockResolvedValueOnce({ ...wellConfiguredSsoConnector, domains });

      await expect(createVerification(email).identifyRelatedUser()).rejects.toMatchError(
        new RequestError({ code: 'user.sso_identity_not_exist', status: 404 })
      );
      expect(findUserByEmail).not.toHaveBeenCalled();
    });
  });

  describe('identifyUser', () => {
    it('identifies a linked identity without checking the email domain', async () => {
      findUserSsoIdentityBySsoIdentityId.mockResolvedValueOnce({ userId: mockUser.id });
      findUserById.mockResolvedValueOnce(mockUser);

      await expect(createVerification('bar@other.com').identifyUser()).resolves.toBe(mockUser);
      expect(findUserSsoIdentityBySsoIdentityId).toHaveBeenCalledWith(
        'https://foo.com',
        'sso-user-id'
      );
      expect(getSsoConnectorById).not.toHaveBeenCalled();
      expect(findUserByEmail).not.toHaveBeenCalled();
    });
  });
});
