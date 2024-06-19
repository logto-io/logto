/**
 * @fileoverview
 * Tests for the organization just-in-time (JIT) provisioning when a user registers with a matched
 * email domain.
 */

import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import { deleteUser, getUserOrganizations, updateSignInExperience } from '#src/api/index.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { logoutClient } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { registerWithEmail } from '#src/helpers/interactions.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import {
  enableAllVerificationCodeSignInMethods,
  resetPasswordPolicy,
} from '#src/helpers/sign-in-experience.js';
import { registerNewUserWithSso } from '#src/helpers/single-sign-on.js';
import { generateEmail, randomString } from '#src/utils.js';

describe('organization just-in-time provisioning', () => {
  const organizationApi = new OrganizationApiTest();
  const ssoConnectorApi = new SsoConnectorApi();

  afterEach(async () => {
    await organizationApi.cleanUp();
  });

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email, ConnectorType.Sms]);
    await Promise.all([setEmailConnector(), setSmsConnector()]);

    await resetPasswordPolicy();
    // Run it sequentially to avoid race condition

    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });
  });

  it('should automatically provision a user to the organization with roles', async () => {
    const organizations = await Promise.all([
      organizationApi.create({ name: 'foo' }),
      organizationApi.create({ name: 'bar' }),
      organizationApi.create({ name: 'baz' }),
    ]);
    const roles = await Promise.all([
      organizationApi.roleApi.create({ name: randomString() }),
      organizationApi.roleApi.create({ name: randomString() }),
    ]);
    const emailDomain = 'foo.com';
    await Promise.all(
      organizations.map(async (organization) =>
        organizationApi.jit.addEmailDomain(organization.id, emailDomain)
      )
    );
    await Promise.all([
      organizationApi.jit.addRole(organizations[0].id, [roles[0].id, roles[1].id]),
      organizationApi.jit.addRole(organizations[1].id, [roles[0].id]),
    ]);

    const email = randomString() + '@' + emailDomain;
    const { client, id } = await registerWithEmail(email);

    const userOrganizations = await getUserOrganizations(id);
    expect(userOrganizations).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: organizations[0].id,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          organizationRoles: expect.arrayContaining([
            expect.objectContaining({ id: roles[0].id }),
            expect.objectContaining({ id: roles[1].id }),
          ]),
        }),
        expect.objectContaining({
          id: organizations[1].id,
          organizationRoles: [expect.objectContaining({ id: roles[0].id })],
        }),
        expect.objectContaining({
          id: organizations[2].id,
          organizationRoles: [],
        }),
      ])
    );

    await logoutClient(client);
    await deleteUser(id);
  });

  it('should automatically provision a user with the matched email to the organization from a SSO identity', async () => {
    const organization = await organizationApi.create({ name: 'sso_foo' });
    const domain = 'sso_example.com';
    await organizationApi.jit.addEmailDomain(organization.id, domain);

    const connector = await ssoConnectorApi.createMockOidcConnector([domain]);
    await updateSignInExperience({
      singleSignOnEnabled: true,
    });

    const userId = await registerNewUserWithSso(connector.id, {
      authData: {
        sub: randomString(),
        email: generateEmail(domain),
        email_verified: true,
      },
    });

    const userOrganizations = await getUserOrganizations(userId);

    expect(userOrganizations).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: organization.id })])
    );

    await deleteUser(userId);
    await ssoConnectorApi.cleanUp();
  });
});
