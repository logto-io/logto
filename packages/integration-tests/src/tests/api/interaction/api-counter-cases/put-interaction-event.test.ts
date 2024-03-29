import { SignInMode, InteractionEvent } from '@logto/schemas';

import { putInteractionEvent, putInteraction } from '#src/api/interaction.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { initClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';

/**
 * Note: These test cases are designed to cover exceptional scenarios of API calls that
 * cannot be covered within the auth flow.
 */
describe('PUT /interaction/event', () => {
  it('Should fail to update interaction event when the related sign-in mode is not enabled', async () => {
    // Init a valid sign-in experience config
    await enableAllPasswordSignInMethods();

    const client = await initClient();

    await updateSignInExperience({
      signInMode: SignInMode.Register,
    });

    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.SignIn,
      }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );

    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
    });

    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.Register,
      }),
      {
        code: 'auth.forbidden',
        status: 403,
      }
    );

    // Reset
    await enableAllPasswordSignInMethods();
  });

  it('Should fail to change interaction event to another event when the initial event is forgot password', async () => {
    // Init a valid sign-in experience config
    await enableAllPasswordSignInMethods();

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.ForgotPassword,
    });

    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.Register,
      }),
      {
        code: 'session.interaction_not_found',
        status: 404,
      }
    );

    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.SignIn,
      }),
      {
        code: 'session.interaction_not_found',
        status: 404,
      }
    );
  });

  it('Should fail to change interaction event to forgot password if the initial event is not forgot password', async () => {
    // Init a valid sign-in experience config
    await enableAllPasswordSignInMethods();

    const client = await initClient();

    await client.successSend(putInteraction, {
      event: InteractionEvent.Register,
    });

    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.ForgotPassword,
      }),
      {
        code: 'session.interaction_not_found',
        status: 404,
      }
    );

    // Change event to sign-in
    await client.successSend(putInteractionEvent, {
      event: InteractionEvent.SignIn,
    });

    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.ForgotPassword,
      }),
      {
        code: 'session.interaction_not_found',
        status: 404,
      }
    );
  });
});
