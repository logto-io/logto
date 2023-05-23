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
});
