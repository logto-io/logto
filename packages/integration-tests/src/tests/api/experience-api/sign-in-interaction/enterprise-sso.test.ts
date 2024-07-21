import { generateStandardId } from '@logto/shared';

import { deleteUser, getUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { SsoConnectorApi } from '#src/api/sso-connector.js';
import { signInWithEnterpriseSso } from '#src/helpers/experience/index.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail } from '#src/utils.js';

devFeatureTest.describe('enterprise sso sign-in and sign-up', () => {
  const ssoConnectorApi = new SsoConnectorApi();
  const domain = 'foo.com';
  const enterpriseSsoIdentityId = generateStandardId();
  const email = generateEmail(domain);

  beforeAll(async () => {
    await ssoConnectorApi.createMockOidcConnector([domain]);
    await updateSignInExperience({
      singleSignOnEnabled: true,
      signUp: { identifiers: [], password: false, verify: false },
    });
  });

  afterAll(async () => {
    await ssoConnectorApi.cleanUp();
  });

  it('should successfully sign-up with enterprise sso and sync email', async () => {
    const userId = await signInWithEnterpriseSso(
      ssoConnectorApi.firstConnectorId!,
      {
        sub: enterpriseSsoIdentityId,
        email,
        email_verified: true,
      },
      true
    );

    const { primaryEmail } = await getUser(userId);
    expect(primaryEmail).toBe(email);
  });

  it('should successfully sign-in with enterprise sso', async () => {
    const userId = await signInWithEnterpriseSso(ssoConnectorApi.firstConnectorId!, {
      sub: enterpriseSsoIdentityId,
      email,
      email_verified: true,
      name: 'John Doe',
    });

    const { name } = await getUser(userId);
    expect(name).toBe('John Doe');

    await deleteUser(userId);
  });

  it('should successfully sign-in and link new enterprise sso identity', async () => {
    const { userProfile, user } = await generateNewUser({
      primaryEmail: true,
    });
    const { primaryEmail } = userProfile;

    const userId = await signInWithEnterpriseSso(ssoConnectorApi.firstConnectorId!, {
      sub: enterpriseSsoIdentityId,
      email: primaryEmail,
      email_verified: true,
      name: 'John Doe',
    });

    expect(userId).toBe(user.id);

    const { name, ssoIdentities } = await getUser(userId, true);

    expect(name).toBe('John Doe');
    expect(ssoIdentities?.some((identity) => identity.identityId === enterpriseSsoIdentityId)).toBe(
      true
    );

    await deleteUser(userId);
  });
});
