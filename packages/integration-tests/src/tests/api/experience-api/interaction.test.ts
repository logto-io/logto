import { InteractionEvent, InteractionIdentifierType } from '@logto/schemas';

import { initExperienceClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

devFeatureTest.describe('PUT /experience API', () => {
  const userApi = new UserApiTest();

  afterAll(async () => {
    await userApi.cleanUp();
  });

  it('PUT new experience API should reset all existing verification records', async () => {
    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const user = await userApi.create({ username, password });

    const client = await initExperienceClient();
    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
    const { verificationId } = await client.verifyPassword({
      identifier: { type: InteractionIdentifierType.Username, value: username },
      password,
    });

    // PUT /experience
    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

    await expectRejects(client.identifyUser({ verificationId }), {
      code: 'session.verification_session_not_found',
      status: 404,
    });
  });
});
