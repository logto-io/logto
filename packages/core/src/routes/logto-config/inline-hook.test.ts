import {
  LogtoInlineHookKey,
  type InlineHook,
  type InlineHookTestRequestBody,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { pick } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';

import {
  mockInlineHookConfigForPostFirstFactorVerification,
  mockInlineHookConfigForPostSignIn,
  mockLogtoConfigRows,
} from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { InlineHookLibrary } from '#src/libraries/inline-hook.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import { mockLogtoConfigsLibrary } from '#src/test-utils/mock-libraries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', isDevFeaturesEnabled);
};

const createResponseError = (status: number, body: Record<string, unknown>) =>
  new ResponseError(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'content-type': 'application/json' },
    })
  );

const inlineHookTestPayload: InlineHookTestRequestBody = {
  hookType: LogtoInlineHookKey.PostSignIn,
  script: `
    const runInlineHook = () => ({ action: 'continue' });
  `,
  event: {
    key: LogtoInlineHookKey.PostSignIn,
  },
};

const logtoConfigQueries = {
  getRowsByKeys: jest.fn(async () => mockLogtoConfigRows),
  deleteInlineHook: jest.fn(),
};

setDevFeaturesEnabled(true);

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs inline hook routes', () => {
  const tenantContext = new MockTenant(
    undefined,
    { logtoConfigs: logtoConfigQueries },
    undefined,
    undefined,
    mockLogtoConfigsLibrary
  );

  const routeRequester = createRequester({
    authedRoutes: settingRoutes,
    tenantContext,
  });
  const routeRequesterWithErrorHandler = createRequester({
    authedRoutes: settingRoutes,
    middlewares: [koaI18next(), koaErrorHandler()],
    tenantContext,
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    setDevFeaturesEnabled(true);
  });

  afterAll(() => {
    setDevFeaturesEnabled(originalIsDevFeaturesEnabled);
  });

  it('GET /configs/inline-hooks should return all records', async () => {
    mockLogtoConfigsLibrary.getInlineHooks.mockResolvedValueOnce({
      [LogtoInlineHookKey.PostSignIn]: mockInlineHookConfigForPostSignIn.value,
      [LogtoInlineHookKey.PostFirstFactorVerification]:
        mockInlineHookConfigForPostFirstFactorVerification.value,
    });

    const response = await routeRequester.get('/configs/inline-hooks');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      pick(mockInlineHookConfigForPostFirstFactorVerification, 'key', 'value'),
      pick(mockInlineHookConfigForPostSignIn, 'key', 'value'),
    ]);
  });

  it('GET /configs/inline-hooks/:hookType should return the record', async () => {
    mockLogtoConfigsLibrary.getInlineHook.mockResolvedValueOnce(
      mockInlineHookConfigForPostSignIn.value
    );

    const response = await routeRequester.get(
      `/configs/inline-hooks/${LogtoInlineHookKey.PostSignIn}`
    );

    expect(mockLogtoConfigsLibrary.getInlineHook).toHaveBeenCalledWith(
      LogtoInlineHookKey.PostSignIn
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockInlineHookConfigForPostSignIn.value);
  });

  it('PUT /configs/inline-hooks/:hookType should add a record successfully', async () => {
    logtoConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockLogtoConfigRows,
      rows: [],
      rowCount: 0,
    });
    mockLogtoConfigsLibrary.upsertInlineHook.mockResolvedValueOnce(
      mockInlineHookConfigForPostSignIn
    );

    const response = await routeRequester
      .put(`/configs/inline-hooks/${LogtoInlineHookKey.PostSignIn}`)
      .send(mockInlineHookConfigForPostSignIn.value);

    expect(logtoConfigQueries.getRowsByKeys).toHaveBeenCalledWith([LogtoInlineHookKey.PostSignIn]);
    expect(mockLogtoConfigsLibrary.upsertInlineHook).toHaveBeenCalledWith(
      LogtoInlineHookKey.PostSignIn,
      mockInlineHookConfigForPostSignIn.value
    );
    expect(response.status).toEqual(201);
    expect(response.body).toEqual(mockInlineHookConfigForPostSignIn.value);
  });

  it('PUT /configs/inline-hooks/:hookType should update a record successfully', async () => {
    logtoConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockLogtoConfigRows,
      rows: [mockInlineHookConfigForPostSignIn],
      rowCount: 1,
    });
    mockLogtoConfigsLibrary.upsertInlineHook.mockResolvedValueOnce(
      mockInlineHookConfigForPostSignIn
    );

    const response = await routeRequester
      .put(`/configs/inline-hooks/${LogtoInlineHookKey.PostSignIn}`)
      .send(mockInlineHookConfigForPostSignIn.value);

    expect(mockLogtoConfigsLibrary.upsertInlineHook).toHaveBeenCalledWith(
      LogtoInlineHookKey.PostSignIn,
      mockInlineHookConfigForPostSignIn.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockInlineHookConfigForPostSignIn.value);
  });

  it('PATCH /configs/inline-hooks/:hookType should partially update a record successfully', async () => {
    const payload = {
      enabled: false,
      onExecutionError: 'allow',
    } satisfies Partial<InlineHook>;
    const updatedConfig = {
      ...mockInlineHookConfigForPostSignIn.value,
      ...payload,
    };

    mockLogtoConfigsLibrary.updateInlineHook.mockResolvedValueOnce(updatedConfig);

    const response = await routeRequester
      .patch(`/configs/inline-hooks/${LogtoInlineHookKey.PostSignIn}`)
      .send(payload);

    expect(mockLogtoConfigsLibrary.updateInlineHook).toHaveBeenCalledWith(
      LogtoInlineHookKey.PostSignIn,
      payload
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(updatedConfig);
  });

  it('DELETE /configs/inline-hooks/:hookType should delete the record', async () => {
    const response = await routeRequester.delete(
      `/configs/inline-hooks/${LogtoInlineHookKey.PostFirstFactorVerification}`
    );

    expect(logtoConfigQueries.deleteInlineHook).toHaveBeenCalledWith(
      LogtoInlineHookKey.PostFirstFactorVerification
    );
    expect(response.status).toEqual(204);
  });

  it('POST /configs/inline-hooks/test should run an inline hook script successfully', async () => {
    const payload: InlineHookTestRequestBody = {
      hookType: LogtoInlineHookKey.PostSignIn,
      script: `
        const runInlineHook = ({ event, environmentVariables }) => ({
          action: 'updateUser',
          user: {
            id: event.user.id,
            profile: {
              source: environmentVariables.source,
            },
          },
        });
      `,
      event: {
        key: LogtoInlineHookKey.PostSignIn,
        interactionEvent: 'SignIn',
        user: {
          id: 'user-id',
        },
      },
      environmentVariables: {
        source: 'test-run',
      },
    };

    const response = await routeRequester.post('/configs/inline-hooks/test').send(payload);

    expect(response.status).toEqual(200);
    expect(response.body).toEqual({
      action: 'updateUser',
      user: {
        id: 'user-id',
        profile: {
          source: 'test-run',
        },
      },
    });
  });

  it('POST /configs/inline-hooks/test should map general execution errors to 422', async () => {
    const payload: InlineHookTestRequestBody = {
      hookType: LogtoInlineHookKey.PostSignIn,
      script: `
        const runInlineHook = () => {
          throw new Error('Boom');
        };
      `,
      event: {
        key: LogtoInlineHookKey.PostSignIn,
      },
    };

    const response = await routeRequester.post('/configs/inline-hooks/test').send(payload);

    expect(response.status).toEqual(422);
  });

  it('POST /configs/inline-hooks/test should preserve the full ResponseError body as error details', async () => {
    const errorBody = {
      message: 'Script failed',
      stack: 'Error: Script failed',
      errors: [{ path: 'event.user', code: 'invalid_type' }],
    };

    jest
      .spyOn(InlineHookLibrary, 'runScriptInLocalVm')
      .mockRejectedValueOnce(createResponseError(422, errorBody));

    const response = await routeRequesterWithErrorHandler
      .post('/configs/inline-hooks/test')
      .send(inlineHookTestPayload);

    expect(response.status).toEqual(422);
    expect(response.body.code).toEqual('inline_hook.general');
    expect(response.body.data).toEqual({
      message: 'Script failed',
      error: errorBody,
    });
  });

  it.each([
    [400, 400],
    [403, 403],
    [422, 422],
    [500, 422],
  ])(
    'POST /configs/inline-hooks/test should map ResponseError status %i to %i',
    async (responseErrorStatus, expectedStatus) => {
      jest.spyOn(InlineHookLibrary, 'runScriptInLocalVm').mockRejectedValueOnce(
        createResponseError(responseErrorStatus, {
          message: 'Remote runner failed',
          error: { reason: 'blocked' },
        })
      );

      const response = await routeRequesterWithErrorHandler
        .post('/configs/inline-hooks/test')
        .send(inlineHookTestPayload);

      expect(response.status).toEqual(expectedStatus);
      expect(response.body.code).toEqual('inline_hook.general');
    }
  );

  it('should not register inline hook routes when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    const requester = createRequester({
      authedRoutes: settingRoutes,
      tenantContext: new MockTenant(
        undefined,
        { logtoConfigs: logtoConfigQueries },
        undefined,
        undefined,
        mockLogtoConfigsLibrary
      ),
    });

    const response = await requester.get('/configs/inline-hooks');

    expect(response.status).toEqual(404);
  });
});
