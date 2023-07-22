/**
 * This file contains special error handling test cases of the main flow (sign-in experience)
 * that are not belong to any specific flow.
 *
 * For normal error handling test cases, please add them to the corresponding test files of the flow.
 */

import { fetchTokenByRefreshToken } from '@logto/js';
import { SignInIdentifier, InteractionEvent } from '@logto/schemas';

import { deleteUser } from '#src/api/admin-user.js';
import { putInteraction } from '#src/api/interaction.js';
import { defaultConfig } from '#src/client/index.js';
import { initClient, processSession } from '#src/helpers/client.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile } from '#src/helpers/user.js';

describe('error handling', () => {
  it('should throw invalid grant error for token endpoint when user is deleted after sign-in', async () => {
    await enableAllPasswordSignInMethods({
      identifiers: [SignInIdentifier.Username],
      password: true,
      verify: false,
    });

    const { username, password } = generateNewUserProfile({ username: true, password: true });
    const client = await initClient();

    await client.send(putInteraction, {
      event: InteractionEvent.Register,
      profile: {
        username,
        password,
      },
    });

    const { redirectTo } = await client.submitInteraction();

    const id = await processSession(client, redirectTo);
    await deleteUser(id);

    await fetchTokenByRefreshToken(
      {
        clientId: defaultConfig.appId,
        tokenEndpoint: defaultConfig.endpoint + '/oidc/token',
        refreshToken: (await client.getRefreshToken())!,
      },
      // @ts-expect-error for testing purpose, no need to pass in a real requester
      async (...args) => {
        const response = await fetch(...args);
        expect(response.status).toBe(400);
        expect(await response.json()).toMatchObject({
          error: 'invalid_grant',
          error_description: 'grant request is invalid',
        });
      }
    );
  });
});
