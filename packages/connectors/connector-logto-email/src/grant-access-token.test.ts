import nock from 'nock';

import { grantAccessToken } from './grant-access-token.js';
import { mockedAccessTokenResponse, mockedConfig } from './mock.js';

describe('grantAccessToken()', () => {
  it('should call got.post() and return access token', async () => {
    nock(mockedConfig.tokenEndpoint).post('').reply(200, JSON.stringify(mockedAccessTokenResponse));

    const response = await grantAccessToken(mockedConfig);

    expect(response).toMatchObject(mockedAccessTokenResponse);
  });
});
