import { sendMessage, validateConfig } from '.';
import { sendSms } from './single-send-text';

jest.mock('./single-send-text');
jest.mock('../utilities', () => ({
  getConnectorConfig: async () => ({
    accessKeyId: 'accessKeyId',
    accessKeySecret: 'accessKeySecret',
    accountName: 'accountName',
    templates: [
      {
        usageType: 'SignIn',
        content: 'Your code is {{code}}, {{code}} is your code',
        subject: 'subject',
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
        accountName: 'accountName',
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
    await sendMessage('to@email.com', 'SignIn', { code: '1234' });
    expect(sendSms).toHaveBeenCalledWith(
      expect.objectContaining({
        HtmlBody: 'Your code is 1234, 1234 is your code',
      }),
      expect.anything()
    );
  });
  it('throws if template is missing', async () => {
    await expect(sendMessage('to@email.com', 'Register', { code: '1234' })).rejects.toThrow();
  });
});
