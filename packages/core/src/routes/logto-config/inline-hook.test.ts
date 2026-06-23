import {
  LogtoInlineHookKey,
  type InlineHook,
  type InlineHookTestRequestBody,
} from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';
import { pick } from '@silverhand/essentials';

import {
  mockInlineHookConfigForPostFirstFactorVerification,
  mockInlineHookConfigForPostSignIn,
  mockLogtoConfigRows,
} from '#src/__mocks__/index.js';
import { EnvSet } from '#src/env-set/index.js';
import { mockLogtoConfigsLibrary } from '#src/test-utils/mock-libraries.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

const setDevFeaturesEnabled = (isDevFeaturesEnabled: boolean) => {
  Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', isDevFeaturesEnabled);
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

  afterEach(() => {
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

  it('POST /configs/inline-hooks/test should map AccessDenied errors to 403', async () => {
    const payload: InlineHookTestRequestBody = {
      hookType: LogtoInlineHookKey.PostSignIn,
      script: `const runInlineHook = ({ api }) => api.denyAccess('Nope');`,
      event: {
        key: LogtoInlineHookKey.PostSignIn,
      },
    };

    const response = await routeRequester.post('/configs/inline-hooks/test').send(payload);

    expect(response.status).toEqual(403);
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

    const response = await requester.post('/configs/inline-hooks/test').send({
      hookType: LogtoInlineHookKey.PostSignIn,
      script: `const runInlineHook = () => ({ action: 'updateUser' });`,
      event: {
        key: LogtoInlineHookKey.PostSignIn,
      },
    } satisfies InlineHookTestRequestBody);

    expect(response.status).toEqual(404);
  });
});
