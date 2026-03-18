import { InteractionHookEvent, type Hook } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';
import { expectRejects } from '#src/helpers/index.js';

import WebhookMockServer from './WebhookMockServer.js';

const responseSuccessPort = 9999;
const responseErrorPort = 9998;

describe('hook testing', () => {
  const successServer = new WebhookMockServer(responseSuccessPort);
  const errorServer = new WebhookMockServer(responseErrorPort, (_, __, response) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    response.statusCode = 500;
    response.end();
  });

  beforeAll(async () => {
    await successServer.listen();
    await errorServer.listen();
  });

  afterAll(async () => {
    await successServer.close();
    await errorServer.close();
  });

  it('should return 204 if test hook successfully', async () => {
    const payload = getHookCreationPayload(
      InteractionHookEvent.PostRegister,
      successServer.endpoint
    );
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();
    const response = await authedAdminApi.post(`hooks/${created.id}/test`, {
      json: { events: [InteractionHookEvent.PostSignIn], config: { url: successServer.endpoint } },
    });
    expect(response.status).toBe(204);

    // Clean Up
    await authedAdminApi.delete(`hooks/${created.id}`);
  });

  it('should return 404 if the hook to test does not exist', async () => {
    const invalidHookId = 'invalid_id';
    await expectRejects(
      authedAdminApi.post(`hooks/${invalidHookId}/test`, {
        json: {
          events: [InteractionHookEvent.PostSignIn],
          config: { url: successServer.endpoint },
        },
      }),
      {
        code: 'entity.not_exists_with_id',
        status: 404,
      }
    );
  });

  it('should return 422 if the hook endpoint is not working', async () => {
    const payload = getHookCreationPayload(InteractionHookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();
    await expectRejects(
      authedAdminApi.post(`hooks/${created.id}/test`, {
        json: { events: [InteractionHookEvent.PostSignIn], config: { url: 'not_work_url' } },
      }),
      {
        code: 'hook.send_test_payload_failed',
        status: 422,
      }
    );

    // Clean Up
    await authedAdminApi.delete(`hooks/${created.id}`);
  });

  it('should return 422 and contains endpoint response if the hook endpoint return 500', async () => {
    const payload = getHookCreationPayload(InteractionHookEvent.PostRegister);
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();
    await expectRejects(
      authedAdminApi.post(`hooks/${created.id}/test`, {
        json: { events: [InteractionHookEvent.PostSignIn], config: { url: errorServer.endpoint } },
      }),
      {
        code: 'hook.endpoint_responded_with_error',
        status: 422,
      }
    );

    // Clean Up
    await authedAdminApi.delete(`hooks/${created.id}`);
  });
});
