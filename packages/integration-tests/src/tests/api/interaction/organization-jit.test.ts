/**
 * @fileoverview
 * Tests for the organization just-in-time (JIT) provisioning when a user registers with a matched
 * email domain.
 */

import { ConnectorType, SignInIdentifier } from '@logto/schemas';

import { deleteUser, getUserOrganizations } from '#src/api/index.js';
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
import { randomString } from '#src/utils.js';

describe('organization just-in-time provisioning', () => {
  const organizationApi = new OrganizationApiTest();

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

  // TODO: Add SSO test case
});
