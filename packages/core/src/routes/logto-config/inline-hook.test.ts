import {
  LogtoInlineHookKey,
  type InlineHook,
  type InlineHookExecutionRequestBody,
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
import RequestError from '#src/errors/RequestError/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import { mockLogtoConfigsLibrary } from '#src/test-utils/mock-libraries.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
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

const inlineHookTestPayload: InlineHookExecutionRequestBody = {
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

const mockQuotaLibrary = createMockQuotaLibrary();

setDevFeaturesEnabled(true);

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs inline hook routes', () => {
  const tenantContext = new MockTenant(
    undefined,
    { logtoConfigs: logtoConfigQueries },
    undefined,
    { quota: mockQuotaLibrary },
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
    expect(mockQuotaLibrary.guardTenantUsageByKey).not.toHaveBeenCalled();
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
    expect(mockQuotaLibrary.guardTenantUsageByKey).not.toHaveBeenCalled();
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
    expect(mockQuotaLibrary.guardTenantUsageByKey).toHaveBeenCalledWith('inlineHooksEnabled');
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
    expect(mockQuotaLibrary.guardTenantUsageByKey).toHaveBeenCalledWith('inlineHooksEnabled');
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
    expect(mockQuotaLibrary.guardTenantUsageByKey).toHaveBeenCalledWith('inlineHooksEnabled');
  });

  it('DELETE /configs/inline-hooks/:hookType should delete the record', async () => {
    const response = await routeRequester.delete(
      `/configs/inline-hooks/${LogtoInlineHookKey.PostFirstFactorVerification}`
    );

    expect(logtoConfigQueries.deleteInlineHook).toHaveBeenCalledWith(
      LogtoInlineHookKey.PostFirstFactorVerification
    );
    expect(response.status).toEqual(204);
    expect(mockQuotaLibrary.guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('POST /configs/inline-hooks/test should run an inline hook script successfully', async () => {
    const payload: InlineHookExecutionRequestBody = {
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
    expect(mockQuotaLibrary.guardTenantUsageByKey).toHaveBeenCalledWith('inlineHooksEnabled');
  });

  it('POST /configs/inline-hooks/test should map general execution errors to 422', async () => {
    const payload: InlineHookExecutionRequestBody = {
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

  it('POST /configs/inline-hooks/test should return only a redacted ResponseError summary', async () => {
    const script = 'const privateInlineHookScript = true;';
    const environmentSecret = 'environment-secret-value';
    const password = 'plain-text-password';
    const payload: InlineHookExecutionRequestBody = {
      hookType: LogtoInlineHookKey.PostFirstFactorVerification,
      script,
      environmentVariables: {
        API_TOKEN: environmentSecret,
      },
      event: {
        key: LogtoInlineHookKey.PostFirstFactorVerification,
        password,
      },
    };
    const errorBody = {
      message: `Script failed ${script} ${environmentSecret} ${password}`,
      stack: `Error: ${script}`,
      errors: [
        {
          path: ['event', password],
          code: 'invalid_type',
          message: `Expected string, received ${password}`,
          received: password,
        },
      ],
      error: {
        request: {
          environmentVariables: { API_TOKEN: environmentSecret },
        },
        returnedUser: {
          customData: { secret: 'returned-patch-secret' },
        },
      },
    };

    jest
      .spyOn(tenantContext.libraries.inlineHooks, 'executeScript')
      .mockRejectedValueOnce(createResponseError(422, errorBody));

    const response = await routeRequesterWithErrorHandler
      .post('/configs/inline-hooks/test')
      .send(payload);

    expect(response.status).toEqual(422);
    expect(response.body.code).toEqual('inline_hook.general');
    expect(response.body.data).toEqual({
      message: 'Script failed [redacted] [redacted] [redacted]',
      errors: [{ path: ['event', '[redacted]'], code: 'invalid_type' }],
    });
    const serializedResponse = JSON.stringify(response.body);
    expect(serializedResponse).not.toContain(script);
    expect(serializedResponse).not.toContain(environmentSecret);
    expect(serializedResponse).not.toContain(password);
    expect(serializedResponse).not.toContain('returned-patch-secret');
  });

  it('POST /configs/inline-hooks/test should preserve safe RequestError semantics', async () => {
    const sensitiveValue = 'request-error-secret';
    const payload: InlineHookExecutionRequestBody = {
      ...inlineHookTestPayload,
      environmentVariables: { API_TOKEN: sensitiveValue },
    };
    const requestError = new RequestError(
      { code: 'connector.general', status: 403 },
      {
        message: `Runner rejected ${sensitiveValue}`,
        errors: [
          {
            path: ['event', sensitiveValue],
            code: 'invalid_type',
            message: sensitiveValue,
            received: sensitiveValue,
          },
        ],
        request: { authorization: `Bearer ${sensitiveValue}` },
      }
    );

    jest
      .spyOn(tenantContext.libraries.inlineHooks, 'executeScript')
      .mockRejectedValueOnce(requestError);

    const response = await routeRequesterWithErrorHandler
      .post('/configs/inline-hooks/test')
      .send(payload);

    expect(response.status).toEqual(403);
    expect(response.body.code).toEqual('connector.general');
    expect(response.body.data).toEqual({
      message: 'Runner rejected [redacted]',
      errors: [{ path: ['event', '[redacted]'], code: 'invalid_type' }],
    });
    expect(response.text).not.toContain(sensitiveValue);
    expect(response.text).not.toContain('authorization');
    expect(response.text).not.toContain('received');
  });

  it.each([
    [400, 400],
    [403, 403],
    [422, 422],
    [500, 422],
  ])(
    'POST /configs/inline-hooks/test should map ResponseError status %i to %i',
    async (responseErrorStatus, expectedStatus) => {
      jest.spyOn(tenantContext.libraries.inlineHooks, 'executeScript').mockRejectedValueOnce(
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

  it('POST /configs/inline-hooks/test should map remote transport failures to inline_hook.general', async () => {
    class TransportError extends Error {
      readonly request = {
        options: {
          headers: { authorization: 'Bearer secret' },
        },
      };
    }

    const transportError = new TransportError("Timeout awaiting 'request' for 5000ms");

    jest
      .spyOn(tenantContext.libraries.inlineHooks, 'executeScript')
      .mockRejectedValueOnce(transportError);

    const response = await routeRequesterWithErrorHandler
      .post('/configs/inline-hooks/test')
      .send(inlineHookTestPayload);

    expect(response.status).toEqual(422);
    expect(response.body.code).toEqual('inline_hook.general');
    expect(response.body.data).toEqual({
      message: "Timeout awaiting 'request' for 5000ms",
    });
    expect(response.text).not.toContain('Bearer secret');
  });

  it('POST /configs/inline-hooks/test should preserve non-Error transport failure details', async () => {
    jest
      .spyOn(tenantContext.libraries.inlineHooks, 'executeScript')
      .mockRejectedValueOnce('Socket closed');

    const response = await routeRequesterWithErrorHandler
      .post('/configs/inline-hooks/test')
      .send(inlineHookTestPayload);

    expect(response.status).toEqual(422);
    expect(response.body.code).toEqual('inline_hook.general');
    expect(response.body.data).toEqual({
      message: 'Socket closed',
    });
  });

  it('should not register inline hook routes when dev features are disabled', async () => {
    setDevFeaturesEnabled(false);

    const requester = createRequester({
      authedRoutes: settingRoutes,
      tenantContext: new MockTenant(
        undefined,
        { logtoConfigs: logtoConfigQueries },
        undefined,
        { quota: mockQuotaLibrary },
        mockLogtoConfigsLibrary
      ),
    });

    const response = await requester.get('/configs/inline-hooks');

    expect(response.status).toEqual(404);
  });
});
