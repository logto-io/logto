import { mockedParameters } from './mock.js';

const post = vi.fn();

vi.mock('got', () => ({
  got: { post },
}));

const { getSignature, request } = await import('./utils.js');

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
  it('should call got.post with extended params', async () => {
    const parameters = mockedParameters;
    await request('http://test.endpoint.com', parameters, 'testsecret');
    const calledData = post.mock.calls[0] as Array<{ form: Record<string, unknown> }>;
    expect(calledData).not.toBeUndefined();
    const payload = calledData[0] ? calledData[0].form : undefined;
    expect(payload?.AccessKeyId).toEqual('testid');
    expect(payload?.Timestamp).not.toBeNull();
    expect(payload?.SignatureNonce).not.toBeNull();
    expect(payload?.Signature).not.toBeNull();
  });
});
