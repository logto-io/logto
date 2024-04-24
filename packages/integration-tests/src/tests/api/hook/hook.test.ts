import type { Hook } from '@logto/schemas';
import { InteractionHookEvent } from '@logto/schemas';

import { authedAdminApi } from '#src/api/index.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';

describe('hooks', () => {
  it('should be able to create, query, update, and delete a hook', async () => {
    const payload = getHookCreationPayload(InteractionHookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();

    expect(created).toMatchObject(payload);

    expect(await authedAdminApi.get('hooks').json<Hook[]>()).toContainEqual(created);
    expect(await authedAdminApi.get(`hooks/${created.id}`).json<Hook>()).toEqual(created);
    expect(
      await authedAdminApi
        .patch(`hooks/${created.id}`, { json: { events: [InteractionHookEvent.PostSignIn] } })
        .json<Hook>()
    ).toMatchObject({ ...created, events: [InteractionHookEvent.PostSignIn] });
    expect(await authedAdminApi.delete(`hooks/${created.id}`)).toHaveProperty('status', 204);
    await expectRejects(authedAdminApi.get(`hooks/${created.id}`), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should be able to create, query, update, and delete a hook by the original API', async () => {
    const payload = {
      event: InteractionHookEvent.PostRegister,
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
        .patch(`hooks/${created.id}`, { json: { event: InteractionHookEvent.PostSignIn } })
        .json<Hook>()
    ).toMatchObject({
      ...created,
      event: InteractionHookEvent.PostSignIn,
    });
    expect(await authedAdminApi.delete(`hooks/${created.id}`)).toHaveProperty('status', 204);
    await expectRejects(authedAdminApi.get(`hooks/${created.id}`), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should return hooks with pagination if pagination-related query params are provided', async () => {
    const payload = getHookCreationPayload(InteractionHookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();

    const response = await authedAdminApi.get('hooks?page=1&page_size=20');

    expect(response.status).toBe(200);
    expect(response.headers.get('total-number')).toEqual(expect.any(String));

    // Clean up
    await authedAdminApi.delete(`hooks/${created.id}`);
  });

  it('should throw error when creating a hook with an empty hook name', async () => {
    const payload = {
      name: '',
      events: [InteractionHookEvent.PostRegister],
      config: {
        url: 'not_work_url',
      },
    };
    await expectRejects(authedAdminApi.post('hooks', { json: payload }), {
      code: 'guard.invalid_input',
      status: 400,
    });
  });

  it('should throw error when no event is provided when creating a hook', async () => {
    const payload = {
      name: 'hook_name',
      config: {
        url: 'not_work_url',
      },
    };
    await expectRejects(authedAdminApi.post('hooks', { json: payload }), {
      code: 'hook.missing_events',
      status: 400,
    });
  });

  it('should throw error if update a hook with a invalid hook id', async () => {
    const payload = {
      name: 'new_hook_name',
    };

    await expectRejects(authedAdminApi.patch('hooks/invalid_id', { json: payload }), {
      code: 'entity.not_exists',
      status: 404,
    });
  });

  it('should throw error if regenerate a hook signing key with a invalid hook id', async () => {
    await expectRejects(authedAdminApi.patch('hooks/invalid_id/signing-key'), {
      code: 'entity.not_exists',
      status: 404,
    });
  });
});
