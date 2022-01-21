import { getAuthorizeUri } from '.';
import { getConnectorConfig } from '../utilities';
import { AUTHORIZE_ENDPOINT } from './constant';

jest.mock('../utilities');

describe('getAuthorizeUri', () => {
  it('should get a valid uri by redirectUri and state', async () => {
    (getConnectorConfig as jest.MockedFunction<typeof getConnectorConfig>).mockResolvedValue({
      clientId: 'log_xx',
    });
    const authorizeUri = await getAuthorizeUri('http://localhost:3000/callback', 'some_state');
    expect(authorizeUri).toEqual(
      `${AUTHORIZE_ENDPOINT}?client_id=log_xx&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback&scope=read%3Auser&state=some_state`
    );
  });
});
