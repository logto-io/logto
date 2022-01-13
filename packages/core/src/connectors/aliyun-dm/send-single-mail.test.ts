import { request } from '../utilities/aliyun';
import { sendSingleMail } from './send-single-mail';

jest.mock('../utilities/aliyun');

describe('sendSingleMail', () => {
  it('should call request with action SingleSendMail', async () => {
    await sendSingleMail(
      {
        AccessKeyId: '<access-key-id>',
        AccountName: 'noreply@example.com',
        ReplyToAddress: 'false',
        AddressType: '1',
        ToAddress: 'user@example.com',
        FromAlias: 'CompanyName',
        Subject: 'test',
        HtmlBody: 'test from logto',
      },
      '<access-key-secret>'
    );
    const calledData = (request as jest.MockedFunction<typeof request>).mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[1];
    expect(payload).toHaveProperty('Action', 'SingleSendMail');
  });
});
