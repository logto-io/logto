import { ConnectorType } from '@logto/connector-kit';
import { SignInIdentifier } from '@logto/schemas';

import { createUser, deleteUser, getUserOrganizations } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import {
  registerNewUserWithVerificationCode,
  signInWithEnterpriseSso,
  signInWithVerificationCode,
} from '#src/helpers/experience/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { enableAllVerificationCodeSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateEmail, randomString } from '#src/utils.js';

describe('organization just-in-time provisioning', () => {
  const organizationApi = new OrganizationApiTest();
  const ssoConnectorApi = new SsoConnectorApi();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await Promise.all([setEmailConnector(), setSmsConnector()]);

    await enableAllVerificationCodeSignInMethods({
      identifiers: [SignInIdentifier.Email],
      password: false,
      verify: true,
    });

    await updateSignInExperience({
      singleSignOnEnabled: true,
    });
  });

  afterEach(async () => {
    await Promise.all([organizationApi.cleanUp(), ssoConnectorApi.cleanUp()]);
  });

  const prepare = async (emailDomain = `foo-${randomString()}.com`, ssoConnectorId?: string) => {
    const organizations = await Promise.all([
      organizationApi.create({ name: 'foo' }),
      organizationApi.create({ name: 'bar' }),
      organizationApi.create({ name: 'baz' }),
    ]);
    const roles = await Promise.all([
      organizationApi.roleApi.create({ name: randomString() }),
      organizationApi.roleApi.create({ name: randomString() }),
    ]);
    await Promise.all(
      organizations.map(async (organization) => {
        if (emailDomain) {
          await organizationApi.jit.addEmailDomain(organization.id, emailDomain);
        }

        if (ssoConnectorId) {
          await organizationApi.jit.ssoConnectors.add(organization.id, [ssoConnectorId]);
        }
      })
    );
    await Promise.all([
      organizationApi.jit.roles.add(organizations[0].id, [roles[0].id, roles[1].id]),
      organizationApi.jit.roles.add(organizations[1].id, [roles[0].id]),
    ]);
    return {
      organizations,
      roles,
      emailDomain,
      expectOrganizations: () =>
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
        ]),
    };
  };

  it('should automatically provision a user with matched email', async () => {
    const { emailDomain, expectOrganizations } = await prepare();
    const email = randomString() + '@' + emailDomain;

    const userId = await registerNewUserWithVerificationCode({
      type: SignInIdentifier.Email,
      value: email,
    });

    const userOrganizations = await getUserOrganizations(userId);
    expect(userOrganizations).toEqual(expectOrganizations());

    await deleteUser(userId);
  });

  it('should not provision a user with the matched email from a SSO identity', async () => {
    const organization = await organizationApi.create({ name: 'sso_foo' });
    const domain = 'sso_example.com';
    await organizationApi.jit.addEmailDomain(organization.id, domain);
    const connector = await ssoConnectorApi.createMockOidcConnector([domain]);

    const userId = await signInWithEnterpriseSso(
      connector.id,
      {
        sub: randomString(),
        email: generateEmail(domain),
        email_verified: true,
      },
      true
    );

    const userOrganizations = await getUserOrganizations(userId);
    expect(userOrganizations).toEqual([]);
    await deleteUser(userId);
  });

  it('should not provision an existing user with the matched email when sign-in', async () => {
    const emailDomain = `foo-${randomString()}.com`;
    const email = randomString() + '@' + emailDomain;
    const userId = await registerNewUserWithVerificationCode({
      type: SignInIdentifier.Email,
      value: email,
    });

    await prepare(emailDomain);

    await signInWithVerificationCode({
      type: SignInIdentifier.Email,
      value: email,
    });

    const userOrganizations = await getUserOrganizations(userId);
    expect(userOrganizations).toEqual([]);
    await deleteUser(userId);
  });

  it('should provision a user with the matched sso connector registration', async () => {
    const organization = await organizationApi.create({ name: 'sso_foo' });
    const domain = 'sso_example.com';
    const connector = await ssoConnectorApi.createMockOidcConnector([domain]);
    await organizationApi.jit.ssoConnectors.add(organization.id, [connector.id]);

    const userId = await signInWithEnterpriseSso(
      connector.id,
      {
        sub: randomString(),
        email: generateEmail(domain),
        email_verified: true,
      },
      true
    );

    const userOrganizations = await getUserOrganizations(userId);

    expect(userOrganizations).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: organization.id })])
    );

    await deleteUser(userId);
  });

  it('should provision a user with the matched linked SSO connector identity', async () => {
    const organization = await organizationApi.create({ name: 'sso_foo' });
    const domain = 'sso_example.com';
    const email = generateEmail(domain);

    const connector = await ssoConnectorApi.createMockOidcConnector([domain]);
    await organizationApi.jit.ssoConnectors.add(organization.id, [connector.id]);

    const user = await createUser({ primaryEmail: email });

    const userId = await signInWithEnterpriseSso(connector.id, {
      sub: randomString(),
      email,
      email_verified: true,
    });

    expect(userId).toBe(user.id);

    const userOrganizations = await getUserOrganizations(userId);
    expect(userOrganizations).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: organization.id })])
    );

    await deleteUser(userId);
  });
});
