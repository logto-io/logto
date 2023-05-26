import { HookEvent, type Hook } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { createResponseWithCode } from '#src/helpers/admin-tenant.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';
import { createMockServer } from '#src/helpers/index.js';

const responseSuccessPort = 9999;
const responseSuccessEndpoint = `http://localhost:${responseSuccessPort}`;

const responseErrorPort = 9998;
const responseErrorEndpoint = `http://localhost:${responseErrorPort}`;

describe('hook testing', () => {
  const { listen, close } = createMockServer(responseSuccessPort);
  const { listen: listenError, close: closeError } = createMockServer(
    responseErrorPort,
    (request, response) => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      response.statusCode = 500;
      response.end();
    }
  );

  beforeAll(async () => {
    await listen();
    await listenError();
  });

  afterAll(async () => {
    await close();
    await closeError();
  });

  it('should return 204 if test hook successfully', async () => {
    const payload = getHookCreationPayload(HookEvent.PostRegister, responseSuccessEndpoint);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();
    const response = await authedAdminApi.post(`hooks/${created.id}/test`, {
      json: { events: [HookEvent.PostSignIn], config: { url: responseSuccessEndpoint } },
    });
    expect(response.statusCode).toBe(204);

    // Clean Up
    await authedAdminApi.delete(`hooks/${created.id}`);
  });

  it('should return 404 if the hook to test does not exist', async () => {
    const invalidHookId = 'invalid_id';
    await expect(
      authedAdminApi.post(`hooks/${invalidHookId}/test`, {
        json: { events: [HookEvent.PostSignIn], config: { url: responseSuccessEndpoint } },
      })
    ).rejects.toMatchObject(createResponseWithCode(404));
  });

  it('should return 500 if the hook endpoint is not working', async () => {
    const payload = getHookCreationPayload(HookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();
    await expect(
      authedAdminApi.post(`hooks/${created.id}/test`, {
        json: { events: [HookEvent.PostSignIn], config: { url: 'not_work_url' } },
      })
    ).rejects.toMatchObject(createResponseWithCode(500));

    // Clean Up
    await authedAdminApi.delete(`hooks/${created.id}`);
  });

  it('should return 204 if the hook endpoint return 500', async () => {
    const payload = getHookCreationPayload(HookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();
    const response = await authedAdminApi.post(`hooks/${created.id}/test`, {
      json: { events: [HookEvent.PostSignIn], config: { url: responseErrorEndpoint } },
    });
    expect(response.statusCode).toBe(204);

    // Clean Up
    await authedAdminApi.delete(`hooks/${created.id}`);
  });
});
