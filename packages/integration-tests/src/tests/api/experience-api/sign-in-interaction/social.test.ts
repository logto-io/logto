import { ConnectorType } from '@logto/connector-kit';
import { generateStandardId } from '@logto/shared';

import { mockSocialConnectorId } from '#src/__mocks__/connectors-mock.js';
import { deleteUser, getUser } from '#src/api/admin-user.js';
import { clearConnectorsByTypes, setSocialConnector } from '#src/helpers/connector.js';
import { signInWithSocial } from '#src/helpers/experience/index.js';
import { devFeatureTest, generateEmail } from '#src/utils.js';

devFeatureTest.describe('social sign-in and sign-up', () => {
  const connectorIdMap = new Map<string, string>();
  const socialUserId = generateStandardId();
  const email = generateEmail();

  beforeAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Social]);

    const { id: socialConnectorId } = await setSocialConnector();
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
      true
    );

    const { primaryEmail } = await getUser(userId);
    expect(primaryEmail).toBe(email);
  });

  it('should successfully sign-in with social', async () => {
    const userId = await signInWithSocial(connectorIdMap.get(mockSocialConnectorId)!, {
      id: socialUserId,
      email,
    });

    await deleteUser(userId);
  });
});
