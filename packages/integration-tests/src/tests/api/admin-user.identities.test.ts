import { ConnectorType } from '@logto/connector-kit';

import {
  mockSocialConnectorId,
  mockSocialConnectorConfig,
  mockSocialConnectorTarget,
} from '#src/__mocks__/connectors-mock.js';
import {
  postUserIdentity,
  putUserIdentity,
  getUser,
  deleteUserIdentity,
  getUserIdentityRelations,
} from '#src/api/admin-user.js';
import {
  postConnector,
  getConnectorAuthorizationUri,
  deleteConnectorById,
} from '#src/api/connector.js';
import { clearConnectorsByTypes } from '#src/helpers/connector.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { createNewSocialUserWithUsernameAndPassword } from '#src/helpers/interactions.js';
import { randomString } from '#src/utils.js';

describe('admin user identities management API', () => {
  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);
  });

  it('should link social identity successfully', async () => {
    const { id: connectorId } = await postConnector({
      connectorId: mockSocialConnectorId,
      config: mockSocialConnectorConfig,
    });

    const state = 'random_state';
    const redirectUri = 'http://mock-social/callback/random_string';
    const code = 'random_code_from_social';
    const socialUserId = 'social_platform_user_id_' + randomString();
    const socialUserEmail = `johndoe_${randomString()}@gmail.com`;
    const anotherSocialUserId = 'another_social_platform_user_id_' + randomString();
    const socialTarget = 'social_target';
    const socialIdentity = {
      userId: 'social_identity_user_id_' + randomString(),
      details: {
        age: 21,
        email: 'foo@logto.io',
      },
    };

    const { id: userId } = await createUserByAdmin();
    const { redirectTo } = await getConnectorAuthorizationUri(connectorId, state, redirectUri);

    expect(redirectTo).toBe(`http://mock-social/?state=${state}&redirect_uri=${redirectUri}`);

    const identities = await postUserIdentity(userId, connectorId, {
      code,
      state,
      redirectUri,
      userId: socialUserId,
      email: socialUserEmail,
    });

    expect(identities).toHaveProperty(mockSocialConnectorTarget);
    expect(identities[mockSocialConnectorTarget]).toMatchObject({
      userId: socialUserId,
      details: {
        id: socialUserId,
        email: socialUserEmail,
        rawData: {
          code,
          email: socialUserEmail,
          redirectUri,
          state,
          userId: socialUserId,
        },
      },
    });

    // Check user identity ids are synced
    const userIdentityRelations = await getUserIdentityRelations(userId);
    expect(userIdentityRelations).toHaveLength(1);
    expect(userIdentityRelations[0]).toMatchObject({
      userId,
      target: mockSocialConnectorTarget,
      identityId: socialUserId,
    });

    const updatedIdentity = await putUserIdentity(userId, mockSocialConnectorTarget, {
      userId: anotherSocialUserId,
      details: {
        id: anotherSocialUserId,
        rawData: {
          userId: anotherSocialUserId,
        },
      },
    });

    expect(updatedIdentity).toHaveProperty(mockSocialConnectorTarget);
    expect(updatedIdentity[mockSocialConnectorTarget]).toMatchObject({
      userId: anotherSocialUserId,
      details: {
        id: anotherSocialUserId,
        rawData: {
          userId: anotherSocialUserId,
        },
      },
    });

    // Check user identity ids are updated
    const updatedUserIdentityRelations = await getUserIdentityRelations(userId);
    expect(updatedUserIdentityRelations).toHaveLength(1);
    expect(updatedUserIdentityRelations[0]).toMatchObject({
      userId,
      target: mockSocialConnectorTarget,
      identityId: anotherSocialUserId,
    });

    const updatedIdentities = await putUserIdentity(userId, socialTarget, socialIdentity);
    expect(updatedIdentities).toMatchObject({
      [mockSocialConnectorTarget]: {
        userId: anotherSocialUserId,
      },
      [socialTarget]: socialIdentity,
    });

    // Check new user identity id
    const newUserIdentityRelations = await getUserIdentityRelations(userId);
    expect(newUserIdentityRelations).toHaveLength(2);
    expect(
      newUserIdentityRelations.find(
        ({ target, identityId }) => target === socialTarget && identityId === socialIdentity.userId
      )
    ).toBeTruthy();

    await deleteConnectorById(connectorId);
  });

  it('should delete user identities successfully', async () => {
    const { id: connectorId } = await postConnector({
      connectorId: mockSocialConnectorId,
      config: mockSocialConnectorConfig,
    });

    const createdUserId = await createNewSocialUserWithUsernameAndPassword(connectorId);

    const userInfo = await getUser(createdUserId);
    expect(userInfo.identities).toHaveProperty(mockSocialConnectorTarget);

    // Check user identity ids are synced
    const userIdentityRelations = await getUserIdentityRelations(createdUserId);
    expect(userIdentityRelations).toHaveLength(1);
    expect(userIdentityRelations[0]).toMatchObject({
      userId: createdUserId,
      target: mockSocialConnectorTarget,
      identityId: userInfo.identities[mockSocialConnectorTarget]?.userId,
    });

    await deleteUserIdentity(createdUserId, mockSocialConnectorTarget);

    const updatedUser = await getUser(createdUserId);
    expect(updatedUser.identities).not.toHaveProperty(mockSocialConnectorTarget);

    // Check user identity ids are updated
    const updatedIdentityIds = await getUserIdentityRelations(createdUserId);
    expect(updatedIdentityIds).toHaveLength(0);

    await deleteConnectorById(connectorId);
  });
});
