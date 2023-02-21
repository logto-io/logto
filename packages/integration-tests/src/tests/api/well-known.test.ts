import type { SignInExperience } from '@logto/schemas';

import { adminTenantApi } from '#src/api/api.js';
import { api } from '#src/api/index.js';

describe('.well-known api', () => {
  it('get /.well-known/sign-in-exp for console', async () => {
    const response = await adminTenantApi.get('.well-known/sign-in-exp').json<SignInExperience>();

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
      signInMode: 'SignInAndRegister',
    });
  });

  it('get /.well-known/sign-in-exp for general app', async () => {
    const response = await api.get('.well-known/sign-in-exp').json<SignInExperience>();

    // Should support sign-in and register
    expect(response).toMatchObject({ signInMode: 'SignInAndRegister' });
  });
});
