import { InteractionEvent } from '@logto/schemas';

import { suspendUser } from '#src/api/admin-user.js';
import { patchInteractionIdentifiers, putInteraction } from '#src/api/interaction.js';
import { initClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';

/**
 * Note: These test cases are designed to cover exceptional scenarios of API calls that
 * cannot be covered within the auth flow.
 */
describe('PATCH /interaction/identifiers', () => {
  it('Should fail to update identifiers with username and password if related user is suspended', async () => {
    // Init a valid sign-in experience config
    await enableAllPasswordSignInMethods();
    const { user, userProfile } = await generateNewUser({ username: true, password: true });
    await suspendUser(user.id, true);

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
    });

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        username: userProfile.username,
        password: userProfile.password,
      }),
      {
        code: 'user.suspended',
        status: 401,
      }
    );
  });
});
