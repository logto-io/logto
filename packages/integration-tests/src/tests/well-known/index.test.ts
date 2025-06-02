import { baseApi } from '#src/api/api.js';

describe('.well-known', () => {
  it('should get webauthn related origins', async () => {
    const response = await baseApi.get('.well-known/webauthn').json();
    expect(response).toMatchObject({
      origins: [],
    });
  });
});
