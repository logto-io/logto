import { SupportedSigningKeyAlgorithm, type AdminConsoleData } from '@logto/schemas';

import {
  deleteOidcKey,
  getAdminConsoleConfig,
  getOidcKeys,
  rotateOidcKeys,
  updateAdminConsoleConfig,
} from '#src/api/index.js';
import { expectRejects } from '#src/helpers/index.js';

const defaultAdminConsoleConfig: AdminConsoleData = {
  signInExperienceCustomized: false,
};

describe('admin console sign-in experience', () => {
  it('should get admin console config successfully', async () => {
    const adminConsoleConfig = await getAdminConsoleConfig();

    expect(adminConsoleConfig).toBeTruthy();
  });

  it('should update admin console config successfully', async () => {
    const newAdminConsoleConfig = {
      signInExperienceCustomized: true,
    };

    const updatedAdminConsoleConfig = await updateAdminConsoleConfig(newAdminConsoleConfig);
    expect(updatedAdminConsoleConfig).toMatchObject({
      ...defaultAdminConsoleConfig,
      ...newAdminConsoleConfig,
    });
  });

  it('should get OIDC keys successfully', async () => {
    const privateKeys = await getOidcKeys('private-keys');
    const cookieKeys = await getOidcKeys('cookie-keys');

    expect(privateKeys).toHaveLength(1);
    expect(privateKeys[0]).toMatchObject(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) }
    );
    expect(cookieKeys).toHaveLength(1);
    expect(cookieKeys[0]).toMatchObject(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), createdAt: expect.any(Number) }
    );
  });

  it('should not be able to delete the only private key', async () => {
    const privateKeys = await getOidcKeys('private-keys');
    expect(privateKeys).toHaveLength(1);
    await expectRejects(deleteOidcKey('private-keys', privateKeys[0]!.id), {
      code: 'oidc.key_required',
      statusCode: 422,
    });

    const cookieKeys = await getOidcKeys('cookie-keys');
    expect(cookieKeys).toHaveLength(1);
    await expectRejects(deleteOidcKey('cookie-keys', cookieKeys[0]!.id), {
      code: 'oidc.key_required',
      statusCode: 422,
    });
  });

  it('should rotate OIDC keys successfully', async () => {
    const existingPrivateKeys = await getOidcKeys('private-keys');
    const newPrivateKeys = await rotateOidcKeys('private-keys', SupportedSigningKeyAlgorithm.RSA);

    expect(newPrivateKeys).toHaveLength(2);
    expect(newPrivateKeys).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'RSA', createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) },
    ]);
    expect(newPrivateKeys[1]?.id).toBe(existingPrivateKeys[0]?.id);

    const existingCookieKeys = await getOidcKeys('cookie-keys');
    const newCookieKeys = await rotateOidcKeys('cookie-keys');

    expect(newCookieKeys).toHaveLength(2);
    expect(newCookieKeys).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), createdAt: expect.any(Number) },
    ]);
    expect(newCookieKeys[1]?.id).toBe(existingCookieKeys[0]?.id);
  });

  it('should only keep 2 recent OIDC keys', async () => {
    const privateKeys = await rotateOidcKeys('private-keys'); // Defaults to 'EC' algorithm

    expect(privateKeys).toHaveLength(2);
    expect(privateKeys).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'RSA', createdAt: expect.any(Number) },
    ]);

    const privateKeys2 = await rotateOidcKeys('private-keys', SupportedSigningKeyAlgorithm.RSA);

    expect(privateKeys2).toHaveLength(2);
    expect(privateKeys2).toMatchObject([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'RSA', createdAt: expect.any(Number) },
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      { id: expect.any(String), signingKeyAlgorithm: 'EC', createdAt: expect.any(Number) },
    ]);
    expect(privateKeys2[1]?.id).toBe(privateKeys[0]?.id);
  });
});
