import { request } from '@logto/connector-types';
import { customAlphabet } from 'nanoid';

import { sendSms } from './single-send-text';

export const passcodeLength = 4;
const randomCode = customAlphabet('1234567890', passcodeLength);

jest.mock('@logto/connector-types');

describe('sendSms', () => {
  it('should call request with action sendSms', async () => {
    const code = randomCode();

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
    const calledData = (request as jest.MockedFunction<typeof request>).mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[1];
    expect(payload).toHaveProperty('Action', 'SendSms');
  });
});
