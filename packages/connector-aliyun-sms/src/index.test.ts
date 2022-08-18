import { GetConnectorConfig, ValidateConfig } from '@logto/connector-schemas';

import AliyunSmsConnector from '.';
import { mockedConnectorConfig, mockedValidConnectorConfig, phoneTest, codeTest } from './mock';
import { sendSms } from './single-send-text';
import { AliyunSmsConfig } from './types';

const getConnectorConfig = jest.fn() as GetConnectorConfig;

const aliyunSmsMethods = new AliyunSmsConnector(getConnectorConfig);

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

  /**
   * Assertion functions always need explicit annotations.
   * See https://github.com/microsoft/TypeScript/issues/36931#issuecomment-589753014
   */

  it('should pass on valid config', async () => {
    const validator: ValidateConfig<AliyunSmsConfig> = aliyunSmsMethods.validateConfig;
    expect(() => {
      validator(mockedValidConnectorConfig);
    }).not.toThrow();
  });

  it('should fail if config is invalid', async () => {
    const validator: ValidateConfig<AliyunSmsConfig> = aliyunSmsMethods.validateConfig;
    expect(() => {
      validator({});
    }).toThrow();
  });
});

describe('sendMessage()', () => {
  beforeEach(() => {
    jest.spyOn(aliyunSmsMethods, 'getConfig').mockResolvedValueOnce(mockedConnectorConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    await aliyunSmsMethods.sendMessage({
      to: phoneTest,
      type: 'SignIn',
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
    await expect(
      aliyunSmsMethods.sendMessage({ to: phoneTest, type: 'Register', payload: { code: codeTest } })
    ).rejects.toThrow();
  });
});
