import { HTTPError } from 'ky';

import {
  createPersonalAccessToken,
  deletePersonalAccessToken,
  deleteUser,
  getUserPersonalAccessTokens,
  updatePersonalAccessToken,
} from '#src/api/admin-user.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { randomString } from '#src/utils.js';

describe('personal access tokens', () => {
  it('should throw error when creating PAT with existing name', async () => {
    const user = await createUserByAdmin();
    const name = randomString();
    await createPersonalAccessToken({ userId: user.id, name });

    const response = await createPersonalAccessToken({ userId: user.id, name }).catch(
      (error: unknown) => error
    );

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 422);
    expect(await (response as HTTPError).response.json()).toHaveProperty(
      'code',
      'user.personal_access_token_name_exists'
    );

    await deleteUser(user.id);
  });

  it('should throw error when creating PAT with invalid user id', async () => {
    const name = randomString();
    const response = await createPersonalAccessToken({
      userId: 'invalid',
      name,
    }).catch((error: unknown) => error);

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 404);
  });

  it('should throw error when creating PAT with empty name', async () => {
    const user = await createUserByAdmin();
    const response = await createPersonalAccessToken({
      userId: user.id,
      name: '',
    }).catch((error: unknown) => error);

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 400);

    await deleteUser(user.id);
  });

  it('should throw error when creating PAT with invalid expiresAt', async () => {
    const user = await createUserByAdmin();
    const name = randomString();
    const response = await createPersonalAccessToken({
      userId: user.id,
      name,
      expiresAt: Date.now() - 1000,
    }).catch((error: unknown) => error);

    expect(response).toBeInstanceOf(HTTPError);
    expect(response).toHaveProperty('response.status', 400);

    await deleteUser(user.id);
  });

  it('should be able to create, get, and delete multiple PATs', async () => {
    const user = await createUserByAdmin();
    const name1 = randomString();
    const name2 = randomString();
    const pat1 = await createPersonalAccessToken({
      userId: user.id,
      name: name1,
      expiresAt: Date.now() + 1000,
    });
    const pat2 = await createPersonalAccessToken({
      userId: user.id,
      name: name2,
    });

    expect(await getUserPersonalAccessTokens(user.id)).toEqual(
      expect.arrayContaining([pat1, pat2])
    );

    await Promise.all([
      deletePersonalAccessToken(user.id, name1),
      deletePersonalAccessToken(user.id, name2),
    ]);
    expect(await getUserPersonalAccessTokens(user.id)).toEqual([]);

    await deleteUser(user.id);
  });

  it('should be able to update PAT', async () => {
    const user = await createUserByAdmin();
    const name = randomString();
    await createPersonalAccessToken({
      userId: user.id,
      name,
    });

    const newName = randomString();
    const updatedPat = await updatePersonalAccessToken(user.id, name, {
      name: newName,
    });
    expect(updatedPat).toEqual(expect.objectContaining({ userId: user.id, name: newName }));

    await deleteUser(user.id);
  });
});
