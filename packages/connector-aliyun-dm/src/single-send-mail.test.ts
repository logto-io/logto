import { singleSendMail } from './single-send-mail';
import { request } from './utils';

jest.mock('./utils');

describe('singleSendMail', () => {
  it('should call request with action SingleSendMail', async () => {
    await singleSendMail(
      {
        AccessKeyId: '<access-key-id>',
        AccountName: 'noreply@example.com',
        AddressType: '1',
        FromAlias: 'CompanyName',
        HtmlBody: 'test from logto',
        ReplyToAddress: 'false',
        Subject: 'test',
        ToAddress: 'user@example.com',
      },
      '<access-key-secret>'
    );
    const calledData = (request as jest.MockedFunction<typeof request>).mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[1];
    expect(payload).toHaveProperty('Action', 'SingleSendMail');
  });
});
