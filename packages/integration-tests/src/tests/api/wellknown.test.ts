import { adminConsoleApplicationId } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { getWellKnownSignInExperience } from '#src/api/index.js';
import MockClient from '#src/client/index.js';
import { adminConsoleRedirectUri } from '#src/constants.js';

describe('wellknown api', () => {
  it('get /.well-known/sign-in-exp for AC', async () => {
    const client = new MockClient({ appId: adminConsoleApplicationId });
    await client.initSession(adminConsoleRedirectUri);

    assert(client.interactionCookie, new Error('Session not found'));

    const response = await getWellKnownSignInExperience(client.interactionCookie);

    expect(response).toMatchObject({
      signUp: {
        identifiers: ['username'],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: 'username',
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
      signInMode: 'SignIn',
    });
  });

  it('get /.well-known/sign-in-exp for general app', async () => {
    const client = new MockClient();

    await client.initSession();

    assert(client.interactionCookie, new Error('Session not found'));

    const response = await getWellKnownSignInExperience(client.interactionCookie);

    // Should support sign-in and register
    expect(response).toMatchObject({ signInMode: 'SignInAndRegister' });
  });
});
