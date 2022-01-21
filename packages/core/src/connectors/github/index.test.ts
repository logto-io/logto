import nock from 'nock';

import { getAccessToken, getAuthorizationUri } from '.';
import { getConnectorConfig } from '../utilities';
import { accessTokenEndpoint, authorizationEndpoint } from './constant';

jest.mock('../utilities');

beforeAll(() => {
  (getConnectorConfig as jest.MockedFunction<typeof getConnectorConfig>).mockResolvedValue({
    clientId: '<client-id>',
    clientSecret: '<client-secret>',
  });
});

describe('getAuthorizationUri', () => {
  it('should get a valid uri by redirectUri and state', async () => {
    const authorizationUri = await getAuthorizationUri(
      'http://localhost:3000/callback',
      'some_state'
    );
    expect(authorizationUri).toEqual(
      `${authorizationEndpoint}?client_id=%3Cclient-id%3E&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=read%3Auser&state=some_state`
    );
  });
});

describe('getAccessToken', () => {
  it('shoud get an accessToken by exchanging with code', async () => {
    nock(accessTokenEndpoint).post('').reply(200, {
      access_token: 'access_token',
      scope: 'scope',
      token_type: 'token_type',
    });
    const accessToken = await getAccessToken('code');
    expect(accessToken).toEqual('access_token');
  });
});
