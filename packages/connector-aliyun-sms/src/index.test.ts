import { MessageTypes, validateConfig } from '@logto/connector-core';

import createConnector from '.';
import { mockedConnectorConfig, mockedValidConnectorConfig, phoneTest, codeTest } from './mock';
import { sendSms } from './single-send-text';
import { AliyunSmsConfig, aliyunSmsConfigGuard } from './types';

const getConfig = jest.fn().mockResolvedValue(mockedConnectorConfig);

function validator(config: unknown): asserts config is AliyunSmsConfig {
  validateConfig<AliyunSmsConfig>(config, aliyunSmsConfigGuard);
}

jest.mock('./single-send-text', () => {
  return {
    sendSms: jest.fn(() => {
      return {
        body: JSON.stringify({ Code: 'OK', RequestId: 'request-id', Message: 'OK' }),
        statusCode: 200,
      };
    }),
  };
});

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    expect(() => {
      validator(mockedValidConnectorConfig);
    }).not.toThrow();
  });

  it('should fail if config is invalid', async () => {
    expect(() => {
      validator({});
    }).toThrow();
  });
});

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    const connector = await createConnector({ getConfig });
    await connector.sendMessage({
      to: phoneTest,
      type: MessageTypes.SignIn,
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

  it('throws if template is missing', async () => {
    const connector = await createConnector({ getConfig });
    await expect(
      connector.sendMessage({
        to: phoneTest,
        type: MessageTypes.Register,
        payload: { code: codeTest },
      })
    ).rejects.toThrow();
  });
});
