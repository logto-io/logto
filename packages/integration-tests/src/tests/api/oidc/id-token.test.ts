import { Prompt } from '@logto/js';
import { InteractionEvent, demoAppApplicationId } from '@logto/schemas';

import { assignRolesToUser, putInteraction } from '#src/api/index.js';
import { createRole } from '#src/api/role.js';
import MockClient from '#src/client/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generatePassword, generateUsername } from '#src/utils.js';

describe('OpenID Connect ID token', () => {
  const username = generateUsername();
  const password = generatePassword();
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId = '';

  const fetchIdToken = async (scopes: string[], expectClaims: Record<string, unknown>) => {
    const client = new MockClient({
      appId: demoAppApplicationId,
      prompt: Prompt.Login,
      scopes,
    });
    await client.initSession(demoAppRedirectUri);
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);
    const idToken = await client.getIdTokenClaims();
    expect(idToken).toMatchObject(expectClaims);
  };

  beforeAll(async () => {
    const { id } = await createUserByAdmin(username, password);
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = id;
    await enableAllPasswordSignInMethods();
  });

  it('should be issued with correct `username` and `roles` claims', async () => {
    const role = await createRole({});
    await assignRolesToUser(userId, [role.id]);
    await fetchIdToken(['username', 'roles'], {
      username,
      roles: [role.name],
    });
  });
});
