import { TemplateType } from '@logto/connector-kit';

import { mockedConnectorConfig, phoneTest, codeTest } from './mock.js';

const getConfig = vi.fn().mockResolvedValue(mockedConnectorConfig);

const sendSms = vi.fn().mockResolvedValue({
  body: JSON.stringify({ Code: 'OK', RequestId: 'request-id', Message: 'OK' }),
  statusCode: 200,
});

vi.mock('./single-send-text.js', () => ({
  sendSms,
}));

const { default: createConnector } = await import('./index.js');

describe('sendMessage()', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: TemplateType.SignIn,
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
        type: TemplateType.Register,
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
      type: TemplateType.Register,
      payload: { code: codeTest },
    });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        TemplateCode: 'TemplateCode2',
      }),
      mockedConnectorConfig.accessKeySecret
    );
  });
});
