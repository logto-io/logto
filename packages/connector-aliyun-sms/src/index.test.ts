import { GetConnectorConfig } from '@logto/connector-types';

import { AliyunSmsConnector, AliyunSmsConfig } from '.';
import { sendSms } from './single-send-text';

const getConnectorConfig = jest.fn() as GetConnectorConfig<AliyunSmsConfig>;

const AliyunSmsMethods = new AliyunSmsConnector(getConnectorConfig);

const defaultConnectorConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  signName: 'signName',
  templates: [
    {
      type: 2,
      usageType: 'SignIn',
      code: 'code',
      name: 'name',
      content: 'content',
      remark: 'remark',
    },
  ],
};

const validConnectorConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  signName: 'signName',
  templates: [],
};

const phoneTest = '13012345678';
const codeTest = '1234';

jest.mock('./single-send-text');

describe('validateConfig()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass on valid config', async () => {
    await expect(AliyunSmsMethods.validateConfig(validConnectorConfig)).resolves.not.toThrow();
  });

  it('throws if config is invalid', async () => {
    await expect(AliyunSmsMethods.validateConfig({})).rejects.toThrow();
  });
});

describe('sendMessage()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call singleSendMail() and replace code in content', async () => {
    jest.spyOn(AliyunSmsMethods, 'getConfig').mockResolvedValueOnce(defaultConnectorConfig);
    await AliyunSmsMethods.sendMessage(phoneTest, 'SignIn', { code: codeTest });
    const { templates, ...credentials } = defaultConnectorConfig;
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        AccessKeyId: credentials.accessKeyId,
        PhoneNumbers: phoneTest,
        SignName: credentials.signName,
        TemplateCode: templates.find(({ usageType }) => usageType === 'SignIn')?.code,
        TemplateParam: `{"code":"${codeTest}"}`,
      }),
      'accessKeySecret'
    );
  });

  it('throws if template is missing', async () => {
    jest.spyOn(AliyunSmsMethods, 'getConfig').mockResolvedValueOnce(defaultConnectorConfig);
    await expect(
      AliyunSmsMethods.sendMessage(phoneTest, 'Register', { code: codeTest })
    ).rejects.toThrow();
  });
});
