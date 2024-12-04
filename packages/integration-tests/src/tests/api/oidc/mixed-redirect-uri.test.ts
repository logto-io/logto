/**
 * @fileoverview Tests for mixed redirect URI protocols. It means web applications can have native
 * redirect URIs and vice versa. Both should work without any issues.
 */

import { Prompt } from '@logto/js';
import { ApplicationType, InteractionEvent } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { createApplication } from '#src/api/application.js';
import { putInteraction } from '#src/api/interaction.js';
import MockClient from '#src/client/index.js';
import { processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

describe('mixed redirect URI protocols', () => {
  const username = generateUsername();
  const password = generatePassword();
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId = '';

  const run = async (applicationType: ApplicationType) => {
    if (
      ![ApplicationType.Native, ApplicationType.Traditional, ApplicationType.SPA].includes(
        applicationType
      )
    ) {
      throw new Error('Unsupported application type');
    }

    const redirectUri =
      applicationType === ApplicationType.Native ? 'http://localhost' : 'myapp://callback';
    const application = await createApplication('Mixed Redirect URI', applicationType, {
      oidcClientMetadata: { redirectUris: [redirectUri], postLogoutRedirectUris: [redirectUri] },
    });
    const client = new MockClient({
      appId: application.id,
      prompt: Prompt.Login,
      scopes: [],
    });
    await client.initSession(redirectUri);
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
  };

  beforeAll(async () => {
    const { id } = await createUserByAdmin({ username, password });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = id;
    await enableAllPasswordSignInMethods();
  });

  afterAll(async () => {
    await deleteUser(userId);
  });

  it('should work for native applications', async () => {
    await run(ApplicationType.Native);
  });

  it('should work for web applications', async () => {
    await run(ApplicationType.SPA);
  });
});
