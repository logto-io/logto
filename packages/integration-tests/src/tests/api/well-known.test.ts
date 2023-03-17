import type { SignInExperience } from '@logto/schemas';

import { adminTenantApi, authedAdminApi } from '#src/api/api.js';
import { api } from '#src/api/index.js';
import { generateUserId } from '#src/utils.js';

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

  it('should use cached version if no-cache header is not present', async () => {
    const response1 = await api.get('.well-known/sign-in-exp').json<SignInExperience>();

    const randomId = generateUserId();
    const customContent = { foo: randomId };
    await authedAdminApi.patch('sign-in-exp', { json: { customContent } }).json<SignInExperience>();

    const response2 = await api
      .get('.well-known/sign-in-exp', { headers: { 'cache-control': '' } })
      .json<SignInExperience>();

    expect(response2.customContent.foo).not.toBe(randomId);
    expect(response2).toStrictEqual(response1);
  });
});
