import { InteractionEvent } from '@logto/schemas';

import {
  putInteractionEvent,
  patchInteractionIdentifiers,
  putInteractionProfile,
  patchInteractionProfile,
  deleteInteractionProfile,
  createSocialAuthorizationUri,
  sendVerificationCode,
  putInteraction,
  deleteInteraction,
} from '#src/api/interaction.js';
import MockClient from '#src/client/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { generateUsername, generatePassword, generateEmail } from '#src/utils.js';

/**
 * Note: These test cases are designed to cover exceptional scenarios of API calls that
 * cannot be covered within the auth flow.
 */
describe('Interaction details guard checking', () => {
  // Create a client without interaction cookies
  const client = new MockClient();

  it('PUT /interaction', async () => {
    await expectRejects(
      client.send(putInteraction, {
        event: InteractionEvent.SignIn,
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });

  it('DELETE /interaction', async () => {
    await expectRejects(client.send(deleteInteraction), {
      code: 'session.not_found',
      status: 400,
    });
  });

  it('PUT /interaction/event', async () => {
    await expectRejects(
      client.send(putInteractionEvent, {
        event: InteractionEvent.SignIn,
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });

  it('PATCH /interaction/identifier', async () => {
    await expectRejects(
      client.send(patchInteractionIdentifiers, {
        username: generateUsername(),
        password: generatePassword(),
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });

  it('PUT /interaction/profile', async () => {
    await expectRejects(
      client.send(putInteractionProfile, {
        username: generateUsername(),
        password: generatePassword(),
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });

  it('PATCH /interaction/profile', async () => {
    await expectRejects(
      client.send(patchInteractionProfile, {
        username: generateUsername(),
        password: generatePassword(),
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });

  it('DELETE /interaction/profile', async () => {
    await expectRejects(client.send(deleteInteractionProfile), {
      code: 'session.not_found',
      status: 400,
    });
  });

  it('POST /interaction/submit', async () => {
    await expectRejects(client.submitInteraction(), {
      code: 'session.not_found',
      status: 400,
    });
  });

  it('POST /interaction/verification/social-authorization-uri', async () => {
    await expectRejects(
      client.send(createSocialAuthorizationUri, {
        state: 'fake_state',
        redirectUri: 'https://logto.dev',
        connectorId: 'fake_connector_id',
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });

  it('POST /interaction/verification/verification-code', async () => {
    await expectRejects(
      client.send(sendVerificationCode, {
        email: generateEmail(),
      }),
      {
        code: 'session.not_found',
        status: 400,
      }
    );
  });
});
