import type { Hooks } from '@logto/schemas/models';
import type { InferModelType } from '@withtyped/server';

import { authedAdminApi } from '#src/api/index.js';

describe('hooks', () => {
  it('should be able to create, query, and delete a hook', async () => {
    type Hook = InferModelType<typeof Hooks>;

    const payload = {
      event: 'PostRegister',
      config: {
        url: 'https://foo.bar',
        headers: { foo: 'bar' },
        retries: 3,
      },
    };
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();

    expect(payload.event).toEqual(created.event);
    expect(payload.config).toEqual(created.config);

    expect(await authedAdminApi.get('hooks').json<Hook[]>()).toContainEqual(created);
    expect(await authedAdminApi.get(`hooks/${created.id}`).json<Hook>()).toEqual(created);
    expect(await authedAdminApi.delete(`hooks/${created.id}`)).toHaveProperty('statusCode', 204);
    await expect(authedAdminApi.get(`hooks/${created.id}`)).rejects.toHaveProperty(
      'response.statusCode',
      404
    );
  });
});
