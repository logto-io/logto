import type { Hook } from '@logto/schemas';
import { HookEvent } from '@logto/schemas';

import { authedAdminApi } from '#src/api/index.js';
import { createResponseWithCode } from '#src/helpers/admin-tenant.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';

describe('hooks', () => {
  it('should be able to create, query, update, and delete a hook', async () => {
    const payload = getHookCreationPayload(HookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();

    expect(created).toMatchObject(payload);

    expect(await authedAdminApi.get('hooks').json<Hook[]>()).toContainEqual(created);
    expect(await authedAdminApi.get(`hooks/${created.id}`).json<Hook>()).toEqual(created);
    expect(
      await authedAdminApi
        .patch(`hooks/${created.id}`, { json: { events: [HookEvent.PostSignIn] } })
        .json<Hook>()
    ).toMatchObject({ ...created, events: [HookEvent.PostSignIn] });
    expect(await authedAdminApi.delete(`hooks/${created.id}`)).toHaveProperty('statusCode', 204);
    await expect(authedAdminApi.get(`hooks/${created.id}`)).rejects.toHaveProperty(
      'response.statusCode',
      404
    );
  });

  it('should be able to create, query, update, and delete a hook by the original API', async () => {
    const payload = {
      event: HookEvent.PostRegister,
      config: {
        url: 'not_work_url',
        retries: 2,
      },
    };
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();

    expect(created).toMatchObject(payload);

    expect(await authedAdminApi.get('hooks').json<Hook[]>()).toContainEqual(created);
    expect(await authedAdminApi.get(`hooks/${created.id}`).json<Hook>()).toEqual(created);
    expect(
      await authedAdminApi
        .patch(`hooks/${created.id}`, { json: { event: HookEvent.PostSignIn } })
        .json<Hook>()
    ).toMatchObject({
      ...created,
      event: HookEvent.PostSignIn,
    });
    expect(await authedAdminApi.delete(`hooks/${created.id}`)).toHaveProperty('statusCode', 204);
    await expect(authedAdminApi.get(`hooks/${created.id}`)).rejects.toHaveProperty(
      'response.statusCode',
      404
    );
  });

  it('should throw error when creating a hook with an empty hook name', async () => {
    const payload = {
      name: '',
      events: [HookEvent.PostRegister],
      config: {
        url: 'not_work_url',
      },
    };
    await expect(authedAdminApi.post('hooks', { json: payload })).rejects.toMatchObject(
      createResponseWithCode(400)
    );
  });

  it('should throw error when no event is provided when creating a hook', async () => {
    const payload = {
      name: 'hook_name',
      config: {
        url: 'not_work_url',
      },
    };
    await expect(authedAdminApi.post('hooks', { json: payload })).rejects.toMatchObject(
      createResponseWithCode(400)
    );
  });

  it('should throw error if update a hook with a invalid hook id', async () => {
    const payload = {
      name: 'new_hook_name',
    };

    await expect(authedAdminApi.patch('hooks/invalid_id', { json: payload })).rejects.toMatchObject(
      createResponseWithCode(404)
    );
  });

  it('should throw error if regenerate a hook signing key with a invalid hook id', async () => {
    await expect(authedAdminApi.patch('hooks/invalid_id/signing-key')).rejects.toMatchObject(
      createResponseWithCode(404)
    );
  });
});
