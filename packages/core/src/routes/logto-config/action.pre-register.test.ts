import { LogtoActionKey, type ActionExecutionRequestBody } from '@logto/schemas';
import { pickDefault } from '@logto/shared/esm';

import { mockActionConfigForPostSignIn, mockLogtoConfigRows } from '#src/__mocks__/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import { resetDevFeaturesEnabled, setDevFeaturesEnabled } from '#src/test-utils/dev-features.js';
import { mockLogtoConfigsLibrary } from '#src/test-utils/mock-libraries.js';
import { createMockQuotaLibrary } from '#src/test-utils/quota.js';
import { MockTenant } from '#src/test-utils/tenant.js';
import { createRequester } from '#src/utils/test-utils.js';

const { jest } = import.meta;

const actionTestPayload: ActionExecutionRequestBody = {
  actionType: LogtoActionKey.PreRegister,
  script: `
    const runAction = () => ({ action: 'allow' });
  `,
  event: {
    key: LogtoActionKey.PreRegister,
  },
};

const logtoConfigQueries = {
  getRowsByKeys: jest.fn(async () => mockLogtoConfigRows),
  deleteAction: jest.fn(),
};

const settingRoutes = await pickDefault(import('./index.js'));

describe('configs pre-register action route gating', () => {
  const tenantContext = new MockTenant(
    undefined,
    { logtoConfigs: logtoConfigQueries },
    undefined,
    { quota: createMockQuotaLibrary() },
    mockLogtoConfigsLibrary
  );

  const createActionRequester = (devFeaturesEnabled: boolean) => {
    setDevFeaturesEnabled(devFeaturesEnabled);
    return createRequester({
      authedRoutes: settingRoutes,
      middlewares: [koaI18next(), koaErrorHandler()],
      tenantContext,
    });
  };

  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
    resetDevFeaturesEnabled();
  });

  it('hides and rejects the pre-register action at the guard while dev features are disabled', async () => {
    const requester = createActionRequester(false);
    mockLogtoConfigsLibrary.getActions.mockResolvedValueOnce({
      [LogtoActionKey.PostSignIn]: mockActionConfigForPostSignIn.value,
      [LogtoActionKey.PreRegister]: mockActionConfigForPostSignIn.value,
    });

    const listResponse = await requester.get('/configs/actions');
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual([
      { key: LogtoActionKey.PostSignIn, value: mockActionConfigForPostSignIn.value },
    ]);

    const path = `/configs/actions/${LogtoActionKey.PreRegister}`;
    await expect(requester.get(path)).resolves.toHaveProperty('status', 400);
    await expect(
      requester.put(path).send(mockActionConfigForPostSignIn.value)
    ).resolves.toHaveProperty('status', 400);
    await expect(requester.patch(path).send({ enabled: true })).resolves.toHaveProperty(
      'status',
      400
    );
    await expect(requester.delete(path)).resolves.toHaveProperty('status', 400);
    await expect(
      requester.post('/configs/actions/test').send(actionTestPayload)
    ).resolves.toHaveProperty('status', 400);

    expect(mockLogtoConfigsLibrary.getAction).not.toHaveBeenCalled();
    expect(mockLogtoConfigsLibrary.upsertAction).not.toHaveBeenCalled();
    expect(mockLogtoConfigsLibrary.updateAction).not.toHaveBeenCalled();
    expect(logtoConfigQueries.deleteAction).not.toHaveBeenCalled();
  });

  it('accepts the pre-register action while dev features are enabled', async () => {
    const requester = createActionRequester(true);
    mockLogtoConfigsLibrary.getAction.mockResolvedValueOnce(mockActionConfigForPostSignIn.value);

    const response = await requester.get(`/configs/actions/${LogtoActionKey.PreRegister}`);

    expect(response.status).toBe(200);
    expect(mockLogtoConfigsLibrary.getAction).toHaveBeenCalledWith(LogtoActionKey.PreRegister);
  });
});
