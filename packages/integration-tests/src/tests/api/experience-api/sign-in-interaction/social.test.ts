import { ConnectorType } from '@logto/connector-kit';
import { generateStandardId } from '@logto/shared';

import {
  mockSocialConnectorId,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import { deleteUser, getUser, getUserIdentity } from '#src/api/admin-user.js';
import { updateConnectorConfig } from '#src/api/connector.js';
import { isDevFeaturesEnabled } from '#src/constants.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import { signInWithSocial } from '#src/helpers/experience/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateEmail } from '#src/utils.js';

describe('social sign-in and sign-up', () => {
  const connectorIdMap = new Map<string, string>();
  const socialUserId = generateStandardId();
  const email = generateEmail();
  const mockTokenResponse = {
    id_token: 'mid_token',
    access_token: 'access_token',
    token_type: 'bearer',
    scope: 'openid',
    expires_in: 3600,
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [],
      password: false,
      verify: false,
    });
    await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email]);

    const { id: socialConnectorId } = await setSocialConnector();

    // Enable token storage
    // TODO: Remove this once we have token storage enabled
    if (isDevFeaturesEnabled) {
      await updateConnectorConfig(socialConnectorId, {
        enableTokenStorage: true,
      });
    }

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
        tokenResponse: mockTokenResponse,
      },
      {
        registerNewUser: true,
      }
    );

    const { primaryEmail } = await getUser(userId);
    expect(primaryEmail).toBe(email);

    // TODO: Remove this once we have token storage enabled
    if (isDevFeaturesEnabled) {
      const { tokenSecret } = await getUserIdentity(userId, mockSocialConnectorTarget);
      expect(tokenSecret?.metadata.scope).toBe(mockTokenResponse.scope);
    }
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
      tokenResponse: {
        ...mockTokenResponse,
        refresh_token: 'refresh_token',
        scope: 'openid profile email',
      },
    });

    const { name } = await getUser(userId);

    expect(name).toBe('John Doe');

    if (isDevFeaturesEnabled) {
      const { tokenSecret } = await getUserIdentity(userId, mockSocialConnectorTarget);
      expect(tokenSecret?.metadata.scope).toBe('openid profile email');
      expect(tokenSecret?.hasRefreshToken).toBe(true);
    }
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
        tokenResponse: {
          ...mockTokenResponse,
          scope: 'openid profile phone',
        },
      },
      { linkSocial: true }
    );

    expect(userId).toBe(user.id);
    const { identities, name } = await getUser(userId);
    expect(identities[mockSocialConnectorTarget]).toBeTruthy();
    expect(name).toBe('Foo Bar');

    if (isDevFeaturesEnabled) {
      const { tokenSecret } = await getUserIdentity(userId, mockSocialConnectorTarget);
      expect(tokenSecret?.metadata.scope).toBe('openid profile phone');
    }

    await deleteUser(userId);
  });
});
