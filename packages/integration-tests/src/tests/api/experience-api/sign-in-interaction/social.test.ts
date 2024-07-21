import { ConnectorType } from '@logto/connector-kit';
import { InteractionEvent, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import {
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import { deleteUser, getUser } from '#src/api/admin-user.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import { signInWithSocial } from '#src/helpers/experience/index.js';
import {
  successFullyCreateSocialVerification,
  successFullyVerifySocialAuthorization,
} from '#src/helpers/experience/social-verification.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { devFeatureTest, generateEmail, generateUsername } from '#src/utils.js';

devFeatureTest.describe('social sign-in and sign-up', () => {
  const connectorIdMap = new Map<string, string>();
  const socialUserId = generateStandardId();
  const email = generateEmail();

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [],
      password: false,
      verify: false,
    });
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);

    const { id: socialConnectorId } = await setSocialConnector();
    await setEmailConnector();
    connectorIdMap.set(mockSocialConnectorId, socialConnectorId);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
  });

  it('should successfully sign-up with social and sync email', async () => {
    const userId = await signInWithSocial(
      connectorIdMap.get(mockSocialConnectorId)!,
      {
        id: socialUserId,
        email,
      },
      {
        registerNewUser: true,
      }
    );

    const { primaryEmail } = await getUser(userId);
    expect(primaryEmail).toBe(email);
  });

  it('should successfully sign-up with social but not sync email if the email is registered by another user', async () => {
    const { userProfile, user } = await generateNewUser({
      primaryEmail: true,
    });

    const { primaryEmail } = userProfile;

    const userId = await signInWithSocial(
      connectorIdMap.get(mockSocialConnectorId)!,
      {
        id: generateStandardId(),
        email: primaryEmail,
      },
      {
        registerNewUser: true,
      }
    );

    expect(userId).not.toBe(user.id);
    const { primaryEmail: newUserPrimaryEmail } = await getUser(userId);
    expect(newUserPrimaryEmail).toBeNull();

    await Promise.all([deleteUser(userId), deleteUser(user.id)]);
  });

  it('should successfully sign-in with social and sync name', async () => {
    const userId = await signInWithSocial(connectorIdMap.get(mockSocialConnectorId)!, {
      id: socialUserId,
      email,
      name: 'John Doe',
    });

    const { name } = await getUser(userId);

    expect(name).toBe('John Doe');

    await deleteUser(userId);
  });

  it('should successfully sign-in with linked email and sync name', async () => {
    const { userProfile, user } = await generateNewUser({
      primaryEmail: true,
    });

    const userId = await signInWithSocial(
      connectorIdMap.get(mockSocialConnectorId)!,
      {
        id: socialUserId,
        email: userProfile.primaryEmail,
        name: 'Foo Bar',
      },
      { linkSocial: true }
    );

    expect(userId).toBe(user.id);
    const { identities, name } = await getUser(userId);
    expect(identities[mockSocialConnectorTarget]).toBeTruthy();
    expect(name).toBe('Foo Bar');

    await deleteUser(userId);
  });

  describe('fulfill missing user profile', () => {
    const state = 'state';
    const redirectUri = 'http://localhost:3000';

    it('should successfully sign-up with social and fulfill missing username', async () => {
      const connectorId = connectorIdMap.get(mockSocialConnectorId)!;

      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      });

      const client = await initExperienceClient();
      await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

      const { verificationId } = await successFullyCreateSocialVerification(client, connectorId, {
        redirectUri,
        state,
      });

      await successFullyVerifySocialAuthorization(client, connectorId, {
        verificationId,
        connectorData: {
          state,
          redirectUri,
          code: 'fake_code',
          userId: generateStandardId(),
        },
      });

      await expectRejects(client.identifyUser({ verificationId }), {
        code: 'user.identity_not_exist',
        status: 404,
      });

      await client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register });
      await client.identifyUser({ verificationId });

      await expectRejects(client.submitInteraction(), {
        code: 'user.missing_profile',
        status: 422,
      });

      await client.updateProfile({ username: generateUsername() });

      const { redirectTo } = await client.submitInteraction();
      const userId = await processSession(client, redirectTo);
      await logoutClient(client);
      await deleteUser(userId);
    });

    it('should directly sync trusted email', async () => {
      await enableAllPasswordSignInMethods({
        identifiers: [SignInIdentifier.Email],
        password: true,
        verify: true,
      });

      const userId = await signInWithSocial(
        connectorIdMap.get(mockSocialConnectorId)!,
        {
          id: socialUserId,
          email,
        },
        {
          registerNewUser: true,
        }
      );

      const { primaryEmail } = await getUser(userId);
      expect(primaryEmail).toBe(email);

      await deleteUser(userId);
    });
  });
});
