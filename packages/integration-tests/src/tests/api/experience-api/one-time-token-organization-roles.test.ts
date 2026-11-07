import { InteractionEvent, SignInIdentifier, SignInMode } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/index.js';
import { createOneTimeToken, deleteOneTimeTokenById } from '#src/api/one-time-token.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { setEmailConnector } from '#src/helpers/connector.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail, generateTestName } from '#src/utils.js';

const completeOneTimeTokenInteraction = async (
  interactionEvent: InteractionEvent,
  email: string,
  token: string
) => {
  const client = await initExperienceClient({ interactionEvent });
  const { verificationId } = await client.verifyOneTimeToken({
    token,
    identifier: { type: SignInIdentifier.Email, value: email },
  });
  await client.identifyUser({ verificationId });

  const { redirectTo } = await client.submitInteraction();
  const userId = await processSession(client, redirectTo);
  await logoutClient(client);

  return userId;
};

devFeatureTest.describe('one-time token with organization roles', () => {
  const organizationApi = new OrganizationApiTest();

  /** Create an organization with a default JIT role, and a role that isn't one of its defaults. */
  const createOrganizationWithRoles = async () => {
    const organization = await organizationApi.create({ name: generateTestName() });
    const [defaultRole, invitedRole] = await Promise.all([
      organizationApi.roleApi.create({ name: generateTestName() }),
      organizationApi.roleApi.create({ name: generateTestName() }),
    ]);
    await organizationApi.jit.roles.add(organization.id, [defaultRole.id]);

    return { organization, defaultRole, invitedRole };
  };

  const getUserRoleIds = async (organizationId: string, userId: string) => {
    const roles = await organizationApi.getUserRoles(organizationId, userId);

    return roles.map(({ id }) => id);
  };

  beforeAll(async () => {
    await setEmailConnector();
    await updateSignInExperience({
      signInMode: SignInMode.SignInAndRegister,
      signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
    });
  });

  afterAll(async () => {
    await organizationApi.cleanUp();
    await organizationApi.roleApi.cleanUp();
  });

  it('should assign the given roles to an existing user instead of the default JIT roles', async () => {
    const { user, userProfile } = await generateNewUser({ primaryEmail: true, password: true });
    const { organization, invitedRole } = await createOrganizationWithRoles();
    const { id, token } = await createOneTimeToken({
      email: userProfile.primaryEmail,
      context: {
        jitOrganizationIds: [organization.id],
        jitOrganizationRoleIds: [invitedRole.id],
      },
    });

    await completeOneTimeTokenInteraction(InteractionEvent.SignIn, userProfile.primaryEmail, token);

    await expect(getUserRoleIds(organization.id, user.id)).resolves.toEqual([invitedRole.id]);

    await deleteOneTimeTokenById(id);
    await deleteUser(user.id);
  });

  it('should assign the given roles to a new user instead of the default JIT roles', async () => {
    const email = generateEmail();
    const { organization, invitedRole } = await createOrganizationWithRoles();
    const { id, token } = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: [organization.id],
        jitOrganizationRoleIds: [invitedRole.id],
      },
    });

    const userId = await completeOneTimeTokenInteraction(InteractionEvent.Register, email, token);

    await expect(getUserRoleIds(organization.id, userId)).resolves.toEqual([invitedRole.id]);

    await deleteOneTimeTokenById(id);
    await deleteUser(userId);
  });

  it('should skip the given roles that are deleted before the token is used', async () => {
    const email = generateEmail();
    const { organization, invitedRole } = await createOrganizationWithRoles();
    const deletedRole = await organizationApi.roleApi.create({ name: generateTestName() });
    const { id, token } = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: [organization.id],
        jitOrganizationRoleIds: [invitedRole.id, deletedRole.id],
      },
    });
    await organizationApi.roleApi.delete(deletedRole.id);

    const userId = await completeOneTimeTokenInteraction(InteractionEvent.Register, email, token);

    await expect(getUserRoleIds(organization.id, userId)).resolves.toEqual([invitedRole.id]);

    await deleteOneTimeTokenById(id);
    await deleteUser(userId);
  });

  it('should keep assigning the default JIT roles when no roles are given', async () => {
    const email = generateEmail();
    const { organization, defaultRole } = await createOrganizationWithRoles();
    const { id, token } = await createOneTimeToken({
      email,
      context: { jitOrganizationIds: [organization.id] },
    });

    const userId = await completeOneTimeTokenInteraction(InteractionEvent.Register, email, token);

    await expect(getUserRoleIds(organization.id, userId)).resolves.toEqual([defaultRole.id]);

    await deleteOneTimeTokenById(id);
    await deleteUser(userId);
  });
});
