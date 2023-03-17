import { CloudScope, ConnectorType, ServiceLogType } from '@logto/schemas';

import { buildRequestAuthContext, createHttpContext } from '#src/test-utils/context.js';
import { noop } from '#src/test-utils/function.js';
import { MockServicesLibrary } from '#src/test-utils/libraries.js';

import { servicesRoutes } from './services.js';

const mockSendMessagePayload = {
  to: 'logto@gmail.com',
  type: 'SignIn',
  payload: { code: '1234' },
};

describe('POST /api/services/send-email', () => {
  const library = new MockServicesLibrary();
  const router = servicesRoutes(library);

  it('should throw 403 when lack of permission', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('POST /services/send-email', {
          body: { data: mockSendMessagePayload },
        })(),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should throw 403 when tenant id not found', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('POST /services/send-email', {
          body: { data: mockSendMessagePayload },
        })([CloudScope.SendEmail]),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should throw 403 when insufficient funds', async () => {
    library.getTenantIdFromApplicationId.mockResolvedValueOnce('tenantId');
    library.getTenantBalanceForType.mockResolvedValueOnce(0);

    await expect(
      router.routes()(
        buildRequestAuthContext('POST /services/send-email', {
          body: { data: mockSendMessagePayload },
        })([CloudScope.SendEmail]),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should return 201', async () => {
    library.getTenantIdFromApplicationId.mockResolvedValueOnce('tenantId');

    await router.routes()(
      buildRequestAuthContext('POST /services/send-email', {
        body: { data: mockSendMessagePayload },
      })([CloudScope.SendEmail]),
      async ({ status }) => {
        expect(status).toBe(201);
        expect(library.sendMessage).toBeCalledWith(ConnectorType.Email, mockSendMessagePayload);
        expect(library.addLog).toBeCalledWith('tenantId', ServiceLogType.SendEmail);
      },
      createHttpContext()
    );
  });
});

describe('POST /api/services/send-sms', () => {
  const library = new MockServicesLibrary();
  const router = servicesRoutes(library);

  it('should throw 403 when lack of permission', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('POST /services/send-sms', {
          body: { data: mockSendMessagePayload },
        })(),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should throw 403 when tenant id not found', async () => {
    await expect(
      router.routes()(
        buildRequestAuthContext('POST /services/send-sms', {
          body: { data: mockSendMessagePayload },
        })([CloudScope.SendSms]),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should throw 403 when insufficient funds', async () => {
    library.getTenantIdFromApplicationId.mockResolvedValueOnce('tenantId');
    library.getTenantBalanceForType.mockResolvedValueOnce(0);

    await expect(
      router.routes()(
        buildRequestAuthContext('POST /services/send-sms', {
          body: { data: mockSendMessagePayload },
        })([CloudScope.SendSms]),
        noop,
        createHttpContext()
      )
    ).rejects.toMatchObject({ status: 403 });
  });

  it('should return 201', async () => {
    library.getTenantIdFromApplicationId.mockResolvedValueOnce('tenantId');

    await router.routes()(
      buildRequestAuthContext('POST /services/send-sms', {
        body: { data: mockSendMessagePayload },
      })([CloudScope.SendSms]),
      async ({ status }) => {
        expect(status).toBe(201);
        expect(library.sendMessage).toBeCalledWith(ConnectorType.Sms, mockSendMessagePayload);
        expect(library.addLog).toBeCalledWith('tenantId', ServiceLogType.SendSms);
      },
      createHttpContext()
    );
  });
});
