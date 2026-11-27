import { createHmac } from 'node:crypto';

import { sign } from './sign.js';

describe('sign', () => {
  it('should generate correct signature', async () => {
    const signingKey = 'foo';
    const payload = {
      bar: 'bar',
      foo: 'foo',
    };

    const signature = sign(signingKey, payload);
    const expectedResult = '436958f1dbfefab37712fb3927760490fbf7757da8c0b2306ee7b485f0360eee';
    expect(signature).toBe(expectedResult);
  });

  it('should generate correct signature if payload is empty', async () => {
    const signingKey = 'foo';
    const payload = {};
    const signature = sign(signingKey, payload);
    const expectedResult = 'c76356efa19d219d1d7e08ccb20b1d26db53b143156f406c99dcb8e0876d6c55';
    expect(signature).toBe(expectedResult);
  });

  it('should sign the exact bytes when given a pre-serialized payload string', () => {
    const signingKey = 'foo';
    const rawPayload = '{"b":1,"a":2}';
    const reorderedPayload = '{"a":2,"b":1}';

    const expected = createHmac('sha256', signingKey).update(rawPayload).digest('hex');

    expect(sign(signingKey, rawPayload)).toBe(expected);
    expect(sign(signingKey, rawPayload)).not.toBe(sign(signingKey, reorderedPayload));
  });
});
