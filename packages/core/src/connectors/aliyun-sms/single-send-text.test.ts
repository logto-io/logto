import { request } from '../utilities/aliyun';
import { singleSendText } from './single-send-text';

jest.mock('../utilities/aliyun');

describe('singleSendMail', () => {
  it('should call request with action SingleSendText', async () => {
    await singleSendText(
      {
        AccessKeyId: '<access-key-id>',
        PhoneNumbers: '13912345678',
        SignName: 'Aliyun',
        TemplateCode: '	SMS_15305',
        TemplateParam: '{ "code": "231678" }',
      },
      '<access-key-secret>'
    );
    const calledData = (request as jest.MockedFunction<typeof request>).mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[1];
    expect(payload).toHaveProperty('Action', 'SingleSendMail');
  });
});
