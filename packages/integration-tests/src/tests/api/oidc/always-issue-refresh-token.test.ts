import { Prompt } from '@logto/node';
import { ApplicationType, InteractionEvent } from '@logto/schemas';

import { createApplication, deleteApplication, putInteraction } from '#src/api/index.js';
import MockClient from '#src/client/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { processSession } from '#src/helpers/client.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateUsername, generatePassword } from '#src/utils.js';

describe('always issue Refresh Token config', () => {
  const username = generateUsername();
  const password = generatePassword();

  const validateRefreshToken = async (appId: string, redirectUri: string, expectToken: boolean) => {
    const client = new MockClient({
      appId,
      prompt: Prompt.Login,
    });
    await client.initSession(redirectUri);
    await client.successSend(putInteraction, {
      event: InteractionEvent.SignIn,
      identifier: { username, password },
    });
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);

    if (expectToken) {
      expect(await client.getRefreshToken()).not.toBeNull();
    } else {
      expect(await client.getRefreshToken()).toBeNull();
    }
  };

  beforeAll(async () => {
    await createUserByAdmin({ username, password });
    await enableAllPasswordSignInMethods();
  });

  it('can sign in and fetch Refresh Token without `prompt=consent` when always issue Refresh Token is set', async () => {
    const app = await createApplication('Integration test app', ApplicationType.SPA, {
      oidcClientMetadata: { redirectUris: [demoAppRedirectUri], postLogoutRedirectUris: [] },
      customClientMetadata: { alwaysIssueRefreshToken: true },
    });
    await validateRefreshToken(app.id, demoAppRedirectUri, true);
    await deleteApplication(app.id);
  });

  it('cannot fetch Refresh Token if alwaysIssueRefreshToken is false and prompt is not consent', async () => {
    const app = await createApplication('Integration test app', ApplicationType.SPA, {
      oidcClientMetadata: { redirectUris: [demoAppRedirectUri], postLogoutRedirectUris: [] },
      customClientMetadata: { alwaysIssueRefreshToken: false },
    });
    await validateRefreshToken(app.id, demoAppRedirectUri, false);
    await deleteApplication(app.id);
  });

  it('cannot fetch Refresh Token for non-web apps', async () => {
    const redirectUri = 'io.logto://callback';
    const app = await createApplication('Integration test app', ApplicationType.Native, {
      oidcClientMetadata: { redirectUris: [redirectUri], postLogoutRedirectUris: [] },
      customClientMetadata: { alwaysIssueRefreshToken: true },
    });
    await validateRefreshToken(app.id, redirectUri, false);
    await deleteApplication(app.id);
  });
});
