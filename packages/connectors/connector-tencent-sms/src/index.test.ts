import { VerificationCodeType } from '@logto/connector-kit';

import { codeTest, mockedConnectorConfig, mockedTemplateCode, phoneTest } from './mock.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConnectorConfig);

const sendSmsRequest = jest.fn(() => {
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

jest.unstable_mockModule('./http.js', () => {
  return {
    sendSmsRequest,
    isSmsErrorResponse: jest.fn((response) => {
      return response.Response.Error !== undefined;
    }),
  };
});

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call sendSmsRequest() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: VerificationCodeType.SignIn,
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

  it('throws if template is missing', async () => {
    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: phoneTest,
        type: VerificationCodeType.Test,
        payload: { code: codeTest },
      })
    ).rejects.toThrow();
  });
});
