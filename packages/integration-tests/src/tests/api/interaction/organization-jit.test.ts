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

  it('should automatically provision a user to the organization with the matched email domain', async () => {
    const organizations = await Promise.all([
      organizationApi.create({ name: 'foo' }),
      organizationApi.create({ name: 'bar' }),
    ]);
    const emailDomain = 'foo.com';
    await Promise.all(
      organizations.map(async (organization) =>
        organizationApi.jit.addEmailDomain(organization.id, emailDomain)
      )
    );

    const email = randomString() + '@' + emailDomain;
    const { client, id } = await registerWithEmail(email);

    const userOrganizations = await getUserOrganizations(id);
    expect(userOrganizations).toEqual(
      expect.arrayContaining(organizations.map((item) => expect.objectContaining({ id: item.id })))
    );

    await logoutClient(client);
    await deleteUser(id);
  });

  it('should automatically provision a user to the organization with the matched email from a SSO identity', async () => {
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
