import { VerificationCodeType } from '@logto/connector-kit';

import { mockedConnectorConfig, phoneTest, codeTest } from './mock.js';

const { jest } = import.meta;

const getConfig = jest.fn().mockResolvedValue(mockedConnectorConfig);

const sendSms = jest.fn().mockResolvedValue({
  body: JSON.stringify({ Code: 'OK', RequestId: 'request-id', Message: 'OK' }),
  statusCode: 200,
});

jest.unstable_mockModule('./single-send-text.js', () => ({
  sendSms,
}));

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: VerificationCodeType.SignIn,
      payload: { code: codeTest },
    });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        AccessKeyId: mockedConnectorConfig.accessKeyId,
        PhoneNumbers: phoneTest,
        SignName: mockedConnectorConfig.signName,
        TemplateCode: 'TemplateCode',
        TemplateParam: `{"code":"${codeTest}"}`,
      }),
      mockedConnectorConfig.accessKeySecret
    );
  });

  it('should use template per region', async () => {
    const connector = await createConnector({ getConfig });

    for (const to of [phoneTest, `86${phoneTest}`, `0086${phoneTest}`, `+86${phoneTest}`]) {
      // eslint-disable-next-line no-await-in-loop
      await connector.sendMessage({
        to,
        type: VerificationCodeType.Register,
        payload: { code: codeTest },
      });
      expect(sendSms).toHaveBeenCalledWith(
        expect.objectContaining({
          TemplateCode: 'TemplateCode1',
        }),
        mockedConnectorConfig.accessKeySecret
      );

      sendSms.mockClear();
    }

    await connector.sendMessage({
      to: '+1123123123',
      type: VerificationCodeType.Register,
      payload: { code: codeTest },
    });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        TemplateCode: 'TemplateCode2',
      }),
      mockedConnectorConfig.accessKeySecret
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
