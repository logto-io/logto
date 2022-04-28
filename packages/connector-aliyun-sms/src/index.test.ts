import { GetConnectorConfig } from '@logto/connector-types';

import { AliyunSmsConnector, AliyunSmsConfig } from '.';
import { mockedConnectorConfig, mockedValidConnectorConfig, phoneTest, codeTest } from './mock';
import { sendSms } from './single-send-text';

const getConnectorConfig = jest.fn() as GetConnectorConfig<AliyunSmsConfig>;

const aliyunSmsMethods = new AliyunSmsConnector(getConnectorConfig);

jest.mock('./single-send-text');

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(
      aliyunSmsMethods.validateConfig(mockedValidConnectorConfig)
    ).resolves.not.toThrow();
  });

  it('throws if config is invalid', async () => {
    await expect(aliyunSmsMethods.validateConfig({})).rejects.toThrow();
  });
});

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    jest.spyOn(aliyunSmsMethods, 'getConfig').mockResolvedValueOnce(mockedConnectorConfig);
    await aliyunSmsMethods.sendMessage(phoneTest, 'SignIn', { code: codeTest });
    const { templates, ...credentials } = mockedConnectorConfig;
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        AccessKeyId: credentials.accessKeyId,
        PhoneNumbers: phoneTest,
        SignName: credentials.signName,
        TemplateCode: 'code',
        TemplateParam: `{"code":"${codeTest}"}`,
      }),
      'accessKeySecret'
    );
  });

  it('throws if template is missing', async () => {
    jest.spyOn(aliyunSmsMethods, 'getConfig').mockResolvedValueOnce(mockedConnectorConfig);
    await expect(
      aliyunSmsMethods.sendMessage(phoneTest, 'Register', { code: codeTest })
    ).rejects.toThrow();
  });
});
