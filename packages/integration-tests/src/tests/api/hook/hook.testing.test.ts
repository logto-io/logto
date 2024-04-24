import { InteractionHookEvent, type Hook } from '@logto/schemas';

import { authedAdminApi } from '#src/api/api.js';
import { getHookCreationPayload } from '#src/helpers/hook.js';
import { createMockServer, expectRejects } from '#src/helpers/index.js';

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
    const payload = getHookCreationPayload(
      InteractionHookEvent.PostRegister,
      responseSuccessEndpoint
    );
    const created = await authedAdminApi.post('hooks', { json: payload }).json<Hook>();
    const response = await authedAdminApi.post(`hooks/${created.id}/test`, {
      json: { events: [InteractionHookEvent.PostSignIn], config: { url: responseSuccessEndpoint } },
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
          config: { url: responseSuccessEndpoint },
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
        json: { events: [InteractionHookEvent.PostSignIn], config: { url: responseErrorEndpoint } },
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
