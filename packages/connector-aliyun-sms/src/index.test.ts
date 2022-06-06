import { GetConnectorConfig } from '@logto/connector-types';

import AliyunSmsConnector from '.';
import { mockedConnectorConfig, mockedValidConnectorConfig, phoneTest, codeTest } from './mock';
import { sendSms } from './single-send-text';
import { AliyunSmsConfig } from './types';

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
  beforeEach(() => {
    jest.spyOn(aliyunSmsMethods, 'getConfig').mockResolvedValueOnce(mockedConnectorConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    await aliyunSmsMethods.sendMessage(phoneTest, 'SignIn', { code: codeTest });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        AccessKeyId: mockedConnectorConfig.accessKeyId,
        PhoneNumbers: phoneTest,
        SignName: mockedConnectorConfig.signName,
        TemplateCode: 'code',
        TemplateParam: `{"code":"${codeTest}"}`,
      }),
      mockedConnectorConfig.accessKeySecret
    );
  });

  it('throws if template is missing', async () => {
    await expect(
      aliyunSmsMethods.sendMessage(phoneTest, 'Register', { code: codeTest })
    ).rejects.toThrow();
  });
});
