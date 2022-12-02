import { adminConsoleApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';

import { getWellKnownSignInExperience } from '@/api';
import MockClient from '@/client';
import { adminConsoleRedirectUri } from '@/constants';

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
