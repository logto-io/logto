import { mockedParameters } from './mock.js';

const post = vi.fn();
vi.mock('got', () => ({
  got: { post },
}));

const { getSignature, request, isChinaNumber } = await import('./utils.js');

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
    const calledData = post.mock.calls[0];
    expect(calledData).not.toBeUndefined();
    const payload = calledData?.[0].form as Record<string, unknown>;
    expect(payload.AccessKeyId).toEqual('testid');
    expect(payload.Timestamp).not.toBeNull();
    expect(payload.SignatureNonce).not.toBeNull();
    expect(payload.Signature).not.toBeNull();
  });
});

describe('isChinaNumber()', () => {
  it('should validate China phone numbers in non-strict mode', () => {
    // Valid cases
    expect(isChinaNumber('13812345678')).toBe(true);
    expect(isChinaNumber('8613812345678')).toBe(true);
    expect(isChinaNumber('008613812345678')).toBe(true);
    expect(isChinaNumber('+8613812345678')).toBe(true);

    // Invalid cases
    expect(isChinaNumber('1381234567')).toBe(false); // Too short
    expect(isChinaNumber('138123456789')).toBe(false); // Too long
    expect(isChinaNumber('abcdefghijk')).toBe(false); // Non-numeric
    expect(isChinaNumber('8513812345678')).toBe(false); // Wrong prefix
  });

  it('should validate China phone numbers in strict mode', () => {
    // Valid cases
    expect(isChinaNumber('8613812345678', true)).toBe(true);
    expect(isChinaNumber('008613812345678', true)).toBe(true);
    expect(isChinaNumber('+8613812345678', true)).toBe(true);

    // Invalid cases
    expect(isChinaNumber('13812345678', true)).toBe(false); // Missing region code
    expect(isChinaNumber('1381234567', true)).toBe(false); // Too short
    expect(isChinaNumber('138123456789', true)).toBe(false); // Too long
    expect(isChinaNumber('abcdefghijk', true)).toBe(false); // Non-numeric
    expect(isChinaNumber('8513812345678', true)).toBe(false); // Wrong prefix
  });
});
