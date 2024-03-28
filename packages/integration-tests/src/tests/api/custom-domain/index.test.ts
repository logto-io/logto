import { ConnectorType, InteractionEvent } from '@logto/schemas';
import ky from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { createDomain, deleteDomain, getDomains } from '#src/api/domain.js';
import { putInteraction } from '#src/api/interaction.js';
import { initClient, logoutClient, processSession } from '#src/helpers/client.js';
import {
  clearConnectorsByTypes,
  setEmailConnector,
  setSmsConnector,
} from '#src/helpers/connector.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateDomain } from '#src/utils.js';

const localHostname = '127.0.0.1';
const localPort = '3001';

const overrideOrigin = (url: string | URL): URL => {
  const newUrl = new URL(url.toString());
  /* eslint-disable @silverhand/fp/no-mutation */
  newUrl.hostname = localHostname;
  newUrl.port = localPort;
  /* eslint-enable @silverhand/fp/no-mutation */
  return newUrl;
};

describe('Using custom domain', () => {
  const domainName = 'auth.example.com';

  beforeAll(async () => {
    await createDomain(domainName);
  });

  afterAll(async () => {
    const domains = await getDomains();
    await Promise.all(domains.map(async (domain) => deleteDomain(domain.id)));
  });

  describe('OIDC discovery', () => {
    it('should return OIDC configuration with custom domain', async () => {
      const response = ky(
        `http://${localHostname}:${localPort}/oidc/.well-known/openid-configuration`,
        {
          headers: {
            Host: domainName,
          },
        }
      );

      await expect(response.json<{ issuer: string }>()).resolves.toMatchObject({
        issuer: `http://${domainName}/oidc`,
      });
    });

    it('should fallback to localhost for unknown domain', async () => {
      const response = ky('http://127.0.0.1:3001/oidc/.well-known/openid-configuration', {
        headers: {
          Host: generateDomain(),
        },
      });

      await expect(response.json<{ issuer: string }>()).resolves.toMatchObject({
        issuer: 'http://localhost:3001/oidc',
      });
    });
  });

  describe('Sign in', () => {
    const originalFetch = global.fetch;
    beforeAll(async () => {
      await enableAllPasswordSignInMethods();
      await clearConnectorsByTypes([ConnectorType.Sms, ConnectorType.Email]);
      await setSmsConnector();
      await setEmailConnector();
      // Intercept fetch request (used in Logto SDK) to custom domain and redirect to localhost
      // eslint-disable-next-line @silverhand/fp/no-mutation
      global.fetch = async (input, init) => {
        if (typeof input === 'string' && input.startsWith(`http://${domainName}`)) {
          return originalFetch(overrideOrigin(input).toString(), {
            ...init,
            headers: {
              ...init?.headers,
              Host: domainName,
            },
          });
        }
        return originalFetch(input, init);
      };
    });

    afterAll(() => {
      // eslint-disable-next-line @silverhand/fp/no-mutation
      global.fetch = originalFetch;
    });

    it('sign-in with custom domain endpoint', async () => {
      const { userProfile, user } = await generateNewUser({ username: true, password: true });
      const client = await initClient({ endpoint: `http://${domainName}` }, undefined, {
        skipIdTokenVerification: true,
        interactionApi: ky.create({
          hooks: {
            beforeRequest: [
              (request) => {
                const url = new URL(request.url);
                if (url.hostname === domainName) {
                  request.headers.set('Host', domainName);
                  return new Request(overrideOrigin(url).toString(), request);
                }
              },
            ],
          },
        }),
      });
      await client.successSend(putInteraction, {
        event: InteractionEvent.SignIn,
        identifier: {
          username: userProfile.username,
          password: userProfile.password,
        },
      });

      const { redirectTo } = await client.submitInteraction();

      await processSession(client, redirectTo);
      await logoutClient(client);

      await deleteUser(user.id);
    });
  });
});
