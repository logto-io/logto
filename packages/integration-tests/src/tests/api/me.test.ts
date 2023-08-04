import { got } from 'got';

import { logtoConsoleUrl, logtoUrl } from '#src/constants.js';
import {
  createUserWithAllRolesAndSignInToClient,
  deleteUser,
  resourceDefault,
  resourceMe,
} from '#src/helpers/admin-tenant.js';
import { expectRejects } from '#src/helpers/index.js';

describe('me', () => {
  it('should only be available in admin tenant', async () => {
    await expectRejects(got.get(new URL('/me/custom-data', logtoConsoleUrl)), {
      code: 'auth.authorization_header_missing',
      statusCode: 401,
    });

    // Redirect to UI
    const response = await got.get(new URL('/me/custom-data', logtoUrl));
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']?.startsWith('text/html;')).toBeTruthy();
  });

  it('should only recognize the access token with correct resource and scope', async () => {
    const { id, client } = await createUserWithAllRolesAndSignInToClient();

    await expectRejects(
      got.get(logtoConsoleUrl + '/me/custom-data', {
        headers: { authorization: `Bearer ${await client.getAccessToken(resourceDefault)}` },
      }),
      {
        code: 'auth.unauthorized',
        statusCode: 401,
      }
    );

    await expect(
      got.get(logtoConsoleUrl + '/me/custom-data', {
        headers: { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` },
      })
    ).resolves.toHaveProperty('statusCode', 200);

    await deleteUser(id);
  });

  it('should be able to update custom data', async () => {
    const { id, client } = await createUserWithAllRolesAndSignInToClient();
    const headers = { authorization: `Bearer ${await client.getAccessToken(resourceMe)}` };

    const data = await got
      .get(logtoConsoleUrl + '/me/custom-data', { headers })
      .json<Record<string, unknown>>();
    const newData = await got
      .patch(logtoConsoleUrl + '/me/custom-data', { headers, json: { foo: 'bar' } })
      .json();

    expect({ ...data, foo: 'bar' }).toStrictEqual(newData);

    await deleteUser(id);
  });
});
