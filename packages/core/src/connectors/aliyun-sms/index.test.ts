import { sendMessage, validateConfig } from '.';
import { sendSms } from './single-send-text';

jest.mock('./single-send-text');
jest.mock('../utilities', () => ({
  getConnectorConfig: async () => ({
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
  }),
}));

describe('validateConfig()', () => {
  it('should pass on valid config', async () => {
    await expect(
      validateConfig({
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        signName: 'signName',
        templates: [],
      })
    ).resolves.not.toThrow();
  });
  it('throws if config is invalid', async () => {
    await expect(validateConfig({})).rejects.toThrow();
  });
});

describe('sendMessage()', () => {
  it('should call singleSendMail() and replace code in content', async () => {
    await sendMessage('13012345678', 'SignIn', { code: '1234' });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        AccessKeyId: 'accessKeyId',
        PhoneNumbers: '13012345678',
        SignName: 'signName',
        TemplateCode: 'code',
        TemplateParam: '{"code":"1234"}',
      }),
      'accessKeySecret'
    );
  });
  it('throws if template is missing', async () => {
    await expect(sendMessage('13012345678', 'Register', { code: '1234' })).rejects.toThrow();
  });
});
