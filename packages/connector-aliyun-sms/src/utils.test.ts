import got from 'got';

import { mockedParameters } from './mock';
import { getSignature, request } from './utils';

jest.mock('got');

describe('getSignature', () => {
  it('should get valid signature', () => {
    const parameters = {
      ...mockedParameters,
      SignatureNonce: 'c1b2c332-4cfb-4a0f-b8cc-ebe622aa0a5c',
      Timestamp: '2016-10-20T06:27:56Z',
    };
    const signature = getSignature(parameters, 'testsecret', 'POST');
    expect(signature).toEqual('llJfXJjBW3OacrVgxxsITgYaYm0=');
  });
});

describe('request', () => {
  it('should call axios.post with extended params', async () => {
    const parameters = mockedParameters;
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
