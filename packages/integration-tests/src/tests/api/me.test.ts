import { ConnectorType } from '@logto/connector-kit';
import { SignInMode, SignInIdentifier } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';
import ky from 'ky';

import { authedAdminTenantApi as api } from '#src/api/api.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { logtoConsoleUrl, logtoUrl } from '#src/constants.js';
import {
  createUserWithAllRolesAndSignInToClient,
  deleteUser,
  resourceDefault,
  resourceMe,
  signUpWithSocialAndSignInToClient,
} from '#src/helpers/admin-tenant.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSocialConnector,
} from '#src/helpers/connector.js';
import { expectRejects } from '#src/helpers/index.js';
import { defaultSignInSignUpConfigs } from '#src/helpers/sign-in-experience.js';
import { generateEmail, generatePassword } from '#src/utils.js';

describe('me', () => {
  it('should only be available in admin tenant', async () => {
    await expectRejects(ky.get(new URL('/me/custom-data', logtoConsoleUrl)), {
      code: 'auth.authorization_header_missing',
      status: 401,
    });

    // Redirect to UI
    const response = await ky.get(new URL('/me/custom-data', logtoUrl));
    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')?.startsWith('text/html;')).toBeTruthy();
  });

  it('should only recognize the access token with correct resource and scope', async () => {
    const { id, client } = await createUserWithAllRolesAndSignInToClient();

    await expectRejects(
      ky.get(logtoConsoleUrl + '/me/custom-data', {
        headers: { authorization: `Bearer ${await client.getAccessToken(resourceDefault)}` },
      }),
      {
        code: 'auth.unauthorized',
        status: 401,
      }
    );

    await expect(
      ky.get(logtoConsoleUrl + '/me/custom-data', {
        headers: { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` },
      })
    ).resolves.toHaveProperty('status', 200);

    await deleteUser(id);
  });

  it('should be able to update custom data', async () => {
    const { id, client } = await createUserWithAllRolesAndSignInToClient();
    const headers = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };

    const data = await ky
      .get(logtoConsoleUrl + '/me/custom-data', { headers })
      .json<Record<string, unknown>>();
    const newData = await ky
      .patch(logtoConsoleUrl + '/me/custom-data', { headers, json: { foo: 'bar' } })
      .json<Record<string, unknown>>();

    expect({ ...data, foo: 'bar' }).toStrictEqual({ ...newData });

    await deleteUser(id);
  });

  it('should be able to verify and reset password', async () => {
    const { id, client, password } = await createUserWithAllRolesAndSignInToClient();
    const headers = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };

    await expectRejects(
      ky.post(logtoConsoleUrl + '/me/password/verify', {
        headers,
        json: { password: 'wrong-password' },
      }),
      {
        code: 'session.invalid_credentials',
        status: 422,
      }
    );

    await expect(
      ky.post(logtoConsoleUrl + '/me/password/verify', {
        headers,
        json: { password },
      })
    ).resolves.toHaveProperty('status', 204);

    // Should reject weak password
    await expect(
      ky.post(logtoConsoleUrl + '/me/password', {
        headers,
        json: { password: '1' },
      })
    ).rejects.toMatchInlineSnapshot('[HTTPError: Request failed with status code 400 Bad Request]');

    await expect(
      ky.post(logtoConsoleUrl + '/me/password', {
        headers,
        json: { password: generatePassword() },
      })
    ).resolves.toHaveProperty('status', 204);

    await deleteUser(id);
  });

  describe('social sign-up user who has no password', () => {
    const context = new (class Context {
      socialConnectorId?: string;
      userId?: string;
    })();

    beforeAll(async () => {
      // Prepare social sign-up and sign-in configs in SIE
      await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email], api);
      const { id: socialConnectorId } = await setSocialConnector(api);
      await setEmailConnector(api);
      await updateSignInExperience(
        {
          signInMode: SignInMode.SignInAndRegister,
          signUp: {
            identifiers: [SignInIdentifier.Email],
            password: false,
            verify: true,
          },
          signIn: {
            methods: [
              {
                identifier: SignInIdentifier.Email,
                password: false,
                verificationCode: true,
                isPasswordPrimary: false,
              },
            ],
          },
        },
        api
      );
      // eslint-disable-next-line @silverhand/fp/no-mutation
      context.socialConnectorId = socialConnectorId;
    });

    afterAll(async () => {
      // Clean up
      await updateSignInExperience(defaultSignInSignUpConfigs, api);
      await clearConnectorsByTypes([ConnectorType.Social, ConnectorType.Email], api);
      await deleteUser(context.userId!);
    });

    it('should allow no-password user to set password', async () => {
      const { id: userId, client } = await signUpWithSocialAndSignInToClient(
        context.socialConnectorId!,
        {
          id: generateStandardId(),
          email: generateEmail(),
        }
      );
      // eslint-disable-next-line @silverhand/fp/no-mutation
      context.userId = userId;

      const headers = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };
      await expect(
        ky.post(logtoConsoleUrl + '/me/password', {
          headers,
          json: { password: generatePassword() },
        })
      ).resolves.toHaveProperty('status', 204);
    });
  });
});
