import { LogtoActionKey, type LogtoAction, type ActionExecutionRequestBody } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { pick } from '@silverhand/essentials';
import { ResponseError } from '@withtyped/client';

import {
  mockActionConfigForPostFirstFactorVerification,
  mockActionConfigForPostSignIn,
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

const actionTestPayload: ActionExecutionRequestBody = {
  actionType: LogtoActionKey.PostSignIn,
  script: `
    const runAction = () => ({ action: 'continue' });
  `,
  event: {
    key: LogtoActionKey.PostSignIn,
  },
};

const logtoConfigQueries = {
  getRowsByKeys: jest.fn(async () => mockLogtoConfigRows),
  deleteAction: jest.fn(),
};

const mockQuotaLibrary = createMockQuotaLibrary();

setDevFeaturesEnabled(true);

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs action routes', () => {
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

  it('GET /configs/actions should return all records', async () => {
    mockLogtoConfigsLibrary.getActions.mockResolvedValueOnce({
      [LogtoActionKey.PostSignIn]: mockActionConfigForPostSignIn.value,
      [LogtoActionKey.PostFirstFactorVerification]:
        mockActionConfigForPostFirstFactorVerification.value,
    });

    const response = await routeRequester.get('/configs/actions');

    expect(response.status).toEqual(200);
    expect(response.body).toEqual([
      pick(mockActionConfigForPostFirstFactorVerification, 'key', 'value'),
      pick(mockActionConfigForPostSignIn, 'key', 'value'),
    ]);
    expect(mockQuotaLibrary.guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('GET /configs/actions/:actionType should return the record', async () => {
    mockLogtoConfigsLibrary.getAction.mockResolvedValueOnce(mockActionConfigForPostSignIn.value);

    const response = await routeRequester.get(`/configs/actions/${LogtoActionKey.PostSignIn}`);

    expect(mockLogtoConfigsLibrary.getAction).toHaveBeenCalledWith(LogtoActionKey.PostSignIn);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockActionConfigForPostSignIn.value);
    expect(mockQuotaLibrary.guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('PUT /configs/actions/:actionType should add a record successfully', async () => {
    logtoConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockLogtoConfigRows,
      rows: [],
      rowCount: 0,
    });
    mockLogtoConfigsLibrary.upsertAction.mockResolvedValueOnce(mockActionConfigForPostSignIn);

    const response = await routeRequester
      .put(`/configs/actions/${LogtoActionKey.PostSignIn}`)
      .send(mockActionConfigForPostSignIn.value);

    expect(logtoConfigQueries.getRowsByKeys).toHaveBeenCalledWith([LogtoActionKey.PostSignIn]);
    expect(mockLogtoConfigsLibrary.upsertAction).toHaveBeenCalledWith(
      LogtoActionKey.PostSignIn,
      mockActionConfigForPostSignIn.value
    );
    expect(response.status).toEqual(201);
    expect(response.body).toEqual(mockActionConfigForPostSignIn.value);
    expect(mockQuotaLibrary.guardTenantUsageByKey).toHaveBeenCalledWith('inlineHooksEnabled');
  });

  it('PUT /configs/actions/:actionType should update a record successfully', async () => {
    logtoConfigQueries.getRowsByKeys.mockResolvedValueOnce({
      ...mockLogtoConfigRows,
      rows: [mockActionConfigForPostSignIn],
      rowCount: 1,
    });
    mockLogtoConfigsLibrary.upsertAction.mockResolvedValueOnce(mockActionConfigForPostSignIn);

    const response = await routeRequester
      .put(`/configs/actions/${LogtoActionKey.PostSignIn}`)
      .send(mockActionConfigForPostSignIn.value);

    expect(mockLogtoConfigsLibrary.upsertAction).toHaveBeenCalledWith(
      LogtoActionKey.PostSignIn,
      mockActionConfigForPostSignIn.value
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(mockActionConfigForPostSignIn.value);
    expect(mockQuotaLibrary.guardTenantUsageByKey).toHaveBeenCalledWith('inlineHooksEnabled');
  });

  it('PATCH /configs/actions/:actionType should partially update a record successfully', async () => {
    const payload = {
      enabled: false,
      onExecutionError: 'allow',
    } satisfies Partial<LogtoAction>;
    const updatedConfig = {
      ...mockActionConfigForPostSignIn.value,
      ...payload,
    };

    mockLogtoConfigsLibrary.updateAction.mockResolvedValueOnce(updatedConfig);

    const response = await routeRequester
      .patch(`/configs/actions/${LogtoActionKey.PostSignIn}`)
      .send(payload);

    expect(mockLogtoConfigsLibrary.updateAction).toHaveBeenCalledWith(
      LogtoActionKey.PostSignIn,
      payload
    );
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(updatedConfig);
    expect(mockQuotaLibrary.guardTenantUsageByKey).toHaveBeenCalledWith('inlineHooksEnabled');
  });

  it('DELETE /configs/actions/:actionType should delete the record', async () => {
    const response = await routeRequester.delete(
      `/configs/actions/${LogtoActionKey.PostFirstFactorVerification}`
    );

    expect(logtoConfigQueries.deleteAction).toHaveBeenCalledWith(
      LogtoActionKey.PostFirstFactorVerification
    );
    expect(response.status).toEqual(204);
    expect(mockQuotaLibrary.guardTenantUsageByKey).not.toHaveBeenCalled();
  });

  it('POST /configs/actions/test should run an action script successfully', async () => {
    const payload: ActionExecutionRequestBody = {
      actionType: LogtoActionKey.PostSignIn,
      script: `
        const runAction = ({ event, environmentVariables }) => ({
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
        key: LogtoActionKey.PostSignIn,
        interactionEvent: 'SignIn',
        user: {
          id: 'user-id',
        },
      },
      environmentVariables: {
        source: 'test-run',
      },
    };

    const response = await routeRequester.post('/configs/actions/test').send(payload);

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

  it('POST /configs/actions/test should distinguish undefined and null results', async () => {
    jest
      .spyOn(tenantContext.libraries.actions, 'executeScript')
      .mockImplementationOnce(async () => {
        await Promise.resolve();
      })
      .mockResolvedValueOnce(null);
    const payload: ActionExecutionRequestBody = {
      actionType: LogtoActionKey.PostSignIn,
      script: 'const runAction = () => undefined;',
      event: {
        key: LogtoActionKey.PostSignIn,
      },
    };

    const undefinedResponse = await routeRequester.post('/configs/actions/test').send(payload);
    const nullResponse = await routeRequester.post('/configs/actions/test').send(payload);

    expect(undefinedResponse.status).toEqual(204);
    expect(undefinedResponse.text).toBe('');
    expect(nullResponse.status).toEqual(200);
    expect(nullResponse.body).toBeNull();
  });

  it('POST /configs/actions/test should map general execution errors to 422', async () => {
    const payload: ActionExecutionRequestBody = {
      actionType: LogtoActionKey.PostSignIn,
      script: `
        const runAction = () => {
          throw new Error('Boom');
        };
      `,
      event: {
        key: LogtoActionKey.PostSignIn,
      },
    };

    const response = await routeRequester.post('/configs/actions/test').send(payload);

    expect(response.status).toEqual(422);
  });

  it('POST /configs/actions/test should return only a redacted ResponseError summary', async () => {
    const script = 'const privateActionScript = true;';
    const environmentSecret = 'environment-secret-value';
    const password = 'plain-text-password';
    const payload: ActionExecutionRequestBody = {
      actionType: LogtoActionKey.PostFirstFactorVerification,
      script,
      environmentVariables: {
        API_TOKEN: environmentSecret,
      },
      event: {
        key: LogtoActionKey.PostFirstFactorVerification,
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
      .spyOn(tenantContext.libraries.actions, 'executeScript')
      .mockRejectedValueOnce(createResponseError(422, errorBody));

    const response = await routeRequesterWithErrorHandler
      .post('/configs/actions/test')
      .send(payload);

    expect(response.status).toEqual(422);
    expect(response.body.code).toEqual('action.general');
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

  it('POST /configs/actions/test should preserve safe RequestError semantics', async () => {
    const sensitiveValue = 'request-error-secret';
    const payload: ActionExecutionRequestBody = {
      ...actionTestPayload,
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
      .spyOn(tenantContext.libraries.actions, 'executeScript')
      .mockRejectedValueOnce(requestError);

    const response = await routeRequesterWithErrorHandler
      .post('/configs/actions/test')
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
    'POST /configs/actions/test should map ResponseError status %i to %i',
    async (responseErrorStatus, expectedStatus) => {
      jest.spyOn(tenantContext.libraries.actions, 'executeScript').mockRejectedValueOnce(
        createResponseError(responseErrorStatus, {
          message: 'Remote runner failed',
          error: { reason: 'blocked' },
        })
      );

      const response = await routeRequesterWithErrorHandler
        .post('/configs/actions/test')
        .send(actionTestPayload);

      expect(response.status).toEqual(expectedStatus);
      expect(response.body.code).toEqual('action.general');
    }
  );

  it('POST /configs/actions/test should map remote transport failures to action.general', async () => {
    class TransportError extends Error {
      readonly request = {
        options: {
          headers: { authorization: 'Bearer secret' },
        },
      };
    }

    const transportError = new TransportError("Timeout awaiting 'request' for 5000ms");

    jest
      .spyOn(tenantContext.libraries.actions, 'executeScript')
      .mockRejectedValueOnce(transportError);

    const response = await routeRequesterWithErrorHandler
      .post('/configs/actions/test')
      .send(actionTestPayload);

    expect(response.status).toEqual(422);
    expect(response.body.code).toEqual('action.general');
    expect(response.body.data).toEqual({
      message: "Timeout awaiting 'request' for 5000ms",
    });
    expect(response.text).not.toContain('Bearer secret');
  });

  it('POST /configs/actions/test should preserve non-Error transport failure details', async () => {
    jest
      .spyOn(tenantContext.libraries.actions, 'executeScript')
      .mockRejectedValueOnce('Socket closed');

    const response = await routeRequesterWithErrorHandler
      .post('/configs/actions/test')
      .send(actionTestPayload);

    expect(response.status).toEqual(422);
    expect(response.body.code).toEqual('action.general');
    expect(response.body.data).toEqual({
      message: 'Socket closed',
    });
  });

  it('should not register action routes when dev features are disabled', async () => {
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

    const response = await requester.get('/configs/actions');

    expect(response.status).toEqual(404);
  });
});
