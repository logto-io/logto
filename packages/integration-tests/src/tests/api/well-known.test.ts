import type { SignInExperience, Translation } from '@logto/schemas';

import api, { adminTenantApi, authedAdminApi } from '#src/api/api.js';

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

  // Also test for Redis cache invalidation
  it('should be able to return updated phrases', async () => {
    const notification = 'Big brother is watching you.';
    const original = await api
      .get('.well-known/phrases?lng=en')
      .json<{ translation: Translation }>();

    expect(original.translation.demo_app).not.toHaveProperty('notification', notification);

    await authedAdminApi.put('custom-phrases/en', { json: { demo_app: { notification } } });
    const updated = await api
      .get('.well-known/phrases?lng=en')
      .json<{ translation: Translation }>();
    expect(updated.translation.demo_app).toHaveProperty('notification', notification);
  });
});
