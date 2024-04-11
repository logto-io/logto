import nock from 'nock';

import { vi, describe, beforeAll, it, expect } from 'vitest';

import { graphAPIEndpoint } from './constant.js';
import createConnector from './index.js';

vi.mock('@azure/msal-node', async () => ({
  ConfidentialClientApplication: class {
    async acquireTokenByCode() {
      return {
        accessToken: 'accessToken',
        scopes: ['scopes'],
        tokenType: 'tokenType',
      };
    }
  },
}));

const getConnectorConfig = vi.fn().mockResolvedValue({
  clientId: 'clientId',
  clientSecret: 'clientSecret',
  cloudInstance: 'https://login.microsoftonline.com',
  tenantId: 'tenantId',
});

describe('Azure AD connector', () => {
  it('init without exploding', () => {
    expect(async () => createConnector({ getConfig: getConnectorConfig })).not.toThrow();
  });
});

describe('getUserInfo', () => {
  beforeAll(async () => {
    const graphMeUrl = new URL(graphAPIEndpoint);
    nock(graphMeUrl.origin).get(graphMeUrl.pathname).reply(200, {
      id: 'id',
      displayName: 'displayName',
      mail: 'mail',
      userPrincipalName: 'userPrincipalName',
    });
  });

  it('should get user info from graph api', async () => {
    const connector = await createConnector({ getConfig: getConnectorConfig });
    const userInfo = await connector.getUserInfo(
      { code: 'code', redirectUri: 'redirectUri' },
      vi.fn()
    );
    expect(userInfo).toEqual({
      id: 'id',
      name: 'displayName',
      email: 'mail',
      rawData: {
        id: 'id',
        displayName: 'displayName',
        mail: 'mail',
        userPrincipalName: 'userPrincipalName',
      },
    });
  });

  it('should throw if graph api response has no id', async () => {
    const graphMeUrl = new URL(graphAPIEndpoint);
    nock(graphMeUrl.origin).get(graphMeUrl.pathname).reply(200, {
      displayName: 'displayName',
      mail: 'mail',
      userPrincipalName: 'userPrincipalName',
    });

    const connector = await createConnector({ getConfig: getConnectorConfig });
    const userInfo = connector.getUserInfo({ code: 'code', redirectUri: 'redirectUri' }, vi.fn());
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await expect(userInfo).rejects.toThrow(expect.objectContaining({ code: 'invalid_response' }));
  });
});
