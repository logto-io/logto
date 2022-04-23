import got from 'got';

import { getSignature, request } from './aliyun';

jest.mock('got');
describe('getSignature', () => {
  it('should get valid signature', () => {
    const parameters = {
      AccessKeyId: 'testid',
      AccountName: "<a%b'>",
      Action: 'SingleSendMail',
      AddressType: '1',
      Format: 'XML',
      HtmlBody: '4',
      RegionId: 'cn-hangzhou',
      ReplyToAddress: 'true',
      SignatureMethod: 'HMAC-SHA1',
      SignatureNonce: 'c1b2c332-4cfb-4a0f-b8cc-ebe622aa0a5c',
      SignatureVersion: '1.0',
      Subject: '3',
      TagName: '2',
      Timestamp: '2016-10-20T06:27:56Z',
      ToAddress: '1@test.com',
      Version: '2015-11-23',
    };
    const signature = getSignature(parameters, 'testsecret', 'POST');
    expect(signature).toEqual('llJfXJjBW3OacrVgxxsITgYaYm0=');
  });
});
describe('request', () => {
  it('should call axios.post with extended params', async () => {
    const parameters = {
      AccessKeyId: 'testid',
      AccountName: "<a%b'>",
      Action: 'SingleSendMail',
      AddressType: '1',
      Format: 'XML',
      HtmlBody: '4',
      RegionId: 'cn-hangzhou',
      ReplyToAddress: 'true',
      Subject: '3',
      TagName: '2',
      ToAddress: '1@test.com',
      Version: '2015-11-23',
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
    };
    await request('http://test.endpoint.com', parameters, 'testsecret');
    const calledData = (got.post as jest.MockedFunction<typeof got.post>).mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[0].form as URLSearchParams;

    expect(payload.get('AccessKeyId')).toEqual('testid');
    expect(payload.get('Timestamp')).not.toBeNull();
    expect(payload.get('SignatureNonce')).not.toBeNull();
    expect(payload.get('Signature')).not.toBeNull();
  });
});
