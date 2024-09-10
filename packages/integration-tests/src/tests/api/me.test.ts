import ky from 'ky';

import { logtoConsoleUrl, logtoUrl } from '#src/constants.js';
import {
  createUserWithAllRolesAndSignInToClient,
  deleteUser,
  resourceDefault,
  resourceMe,
} from '#src/helpers/admin-tenant.js';
import { expectRejects } from '#src/helpers/index.js';
import { generatePassword } from '#src/utils.js';

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
});
