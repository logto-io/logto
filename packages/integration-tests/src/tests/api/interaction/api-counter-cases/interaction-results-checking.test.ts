import { InteractionEvent } from '@logto/schemas';

import {
  putInteractionEvent,
  patchInteractionIdentifiers,
  putInteractionProfile,
  patchInteractionProfile,
  deleteInteractionProfile,
  createSocialAuthorizationUri,
  sendVerificationCode,
} from '#src/api/interaction.js';
import { initClient } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateUsername, generatePassword, generateEmail } from '#src/utils.js';

/**
 * Note: These test cases are designed to cover exceptional scenarios of API calls that
 * cannot be covered within the auth flow.
 */
describe('Interaction details results checking', () => {
  it('PUT /interaction/event', async () => {
    const client = await initClient();
    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.SignIn,
      }),
      {
        code: 'session.verification_session_not_found',
        status: 404,
      }
    );
  });

  it('PATCH /interaction/identifier', async () => {
    const client = await initClient();

    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        username: generateUsername(),
        password: generatePassword(),
      }),
      {
        code: 'session.verification_session_not_found',
        status: 404,
      }
    );
  });

  it('PUT /interaction/profile', async () => {
    const client = await initClient();
    await expectRejects(
      client.send(putInteractionProfile, {
        username: generateUsername(),
        password: generatePassword(),
      }),
      {
        code: 'session.verification_session_not_found',
        status: 404,
      }
    );
  });

  it('PATCH /interaction/profile', async () => {
    const client = await initClient();
    await expectRejects(
      client.send(patchInteractionProfile, {
        username: generateUsername(),
        password: generatePassword(),
      }),
      {
        code: 'session.verification_session_not_found',
        status: 404,
      }
    );
  });

  it('DELETE /interaction/profile', async () => {
    const client = await initClient();
    await expectRejects(client.send(deleteInteractionProfile), {
      code: 'session.verification_session_not_found',
      status: 404,
    });
  });

  it('POST /interaction/submit', async () => {
    const client = await initClient();
    await expectRejects(client.submitInteraction(), {
      code: 'session.verification_session_not_found',
      status: 404,
    });
  });

  it('POST /interaction/verification/social-authorization-uri', async () => {
    const client = await initClient();
    await expectRejects(
      client.send(createSocialAuthorizationUri, {
        state: 'fake_state',
        redirectUri: 'https://logto.dev',
        connectorId: 'fake_connector_id',
      }),
      {
        code: 'session.verification_session_not_found',
        status: 404,
      }
    );
  });

  it('POST /interaction/verification/verification-code', async () => {
    const client = await initClient();
    await expectRejects(
      client.send(sendVerificationCode, {
        email: generateEmail(),
      }),
      {
        code: 'session.verification_session_not_found',
        status: 404,
      }
    );
  });
});
