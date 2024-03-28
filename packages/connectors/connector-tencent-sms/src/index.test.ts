import { TemplateType } from '@logto/connector-kit';

import { codeTest, mockedConnectorConfig, mockedTemplateCode, phoneTest } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConnectorConfig);

const sendSmsRequest = vi.fn(() => {
  return {
    body: {
      Response: {
        RequestId: 'request-id',
        SendStatusSet: [
          {
            Fee: 1,
            SerialNo: 'serial-no',
            SessionContext: 'session-context',
            Code: 'Ok',
            Message: 'OK',
            IsoCode: 'CN',
          },
        ],
      },
    },
    statusCode: 200,
  };
});

vi.mock('./http.js', () => {
  return {
    sendSmsRequest,
    isSmsErrorResponse: vi.fn((response) => {
      return response.Response.Error !== undefined;
    }),
  };
});

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call sendSmsRequest() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: TemplateType.SignIn,
      payload: { code: codeTest },
    });
    expect(sendSmsRequest).toHaveBeenCalledWith(
      mockedTemplateCode,
      [codeTest],
      phoneTest,
      expect.objectContaining({
        region: mockedConnectorConfig.region,
        sdkAppId: mockedConnectorConfig.sdkAppId,
        secretId: mockedConnectorConfig.accessKeyId,
        secretKey: mockedConnectorConfig.accessKeySecret,
        signName: mockedConnectorConfig.signName,
      })
    );
  });
});
