import { sendMessage, validateConfig } from '.';
import { sendSms } from './single-send-text';

const defaultConnectorConfig = {
  accessKeyId: 'accessKeyId',
  accessKeySecret: 'accessKeySecret',
  signName: 'signName',
  templates: [
    {
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
jest.mock('../utilities', () => ({
  getConnectorConfig: async () => defaultConnectorConfig,
}));

describe('validateConfig()', () => {
  it('should pass on valid config', async () => {
    await expect(validateConfig(validConnectorConfig)).resolves.not.toThrow();
  });
  it('throws if config is invalid', async () => {
    await expect(validateConfig({})).rejects.toThrow();
  });
});

describe('sendMessage()', () => {
  it('should call singleSendMail() and replace code in content', async () => {
    await sendMessage(phoneTest, 'SignIn', { code: codeTest });
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
    await expect(sendMessage(phoneTest, 'Register', { code: codeTest })).rejects.toThrow();
  });
});
