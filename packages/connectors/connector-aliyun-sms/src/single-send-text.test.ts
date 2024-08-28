import { mockedRandomCode } from './mock.js';

const request = vi.fn();

vi.mock('./utils.js', () => ({ request }));

const { sendSms } = await import('./single-send-text.js');

describe('sendSms', () => {
  it('should call request with action sendSms', async () => {
    const code = mockedRandomCode;

    await sendSms(
      {
        AccessKeyId: '<access-key-id>',
        PhoneNumbers: '13912345678',
        SignName: '阿里云短信测试',
        TemplateCode: '	SMS_154950909',
        TemplateParam: JSON.stringify({ code }),
      },
      '<access-key-secret>'
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const calledData = request.mock.calls[0];
    expect(calledData).not.toBeUndefined();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const payload = calledData?.[1];
    expect(payload).toHaveProperty('Action', 'SendSms');
  });
});
