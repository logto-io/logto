import { customAlphabet } from 'nanoid';

import { request } from '../utilities/aliyun';
import { sendSms } from './single-send-text';

const passcodeGenerator = () => customAlphabet('0123456789', 6);

jest.mock('../utilities/aliyun');

describe('sendSms', () => {
  it('should call request with action sendSms', async () => {
    const passcode = passcodeGenerator();

    await sendSms(
      {
        AccessKeyId: '<access-key-id>',
        PhoneNumbers: '13912345678',
        SignName: '阿里云短信测试',
        TemplateCode: '	SMS_154950909',
        TemplateParam: JSON.stringify({ code: passcode }),
      },
      '<access-key-secret>'
    );
    const calledData = (request as jest.MockedFunction<typeof request>).mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[1];
    expect(payload).toHaveProperty('Action', 'SendSms');
  });
});
