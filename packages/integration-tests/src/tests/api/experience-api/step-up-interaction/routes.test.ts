import { Prompt } from '@logto/node';
import { ConnectorType, InteractionEvent, SignInIdentifier } from '@logto/schemas';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import { authorizeWithSession } from '#src/helpers/experience/authorization.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { expectRejects } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';

const expectForbidden = async (promise: Promise<unknown>) =>
  expectRejects(promise, { code: 'session.step_up.forbidden_route', status: 403 });

/** Force a `1fa` step-up on the signed-in client and land on the step-up path. */
const startStepUp = async (client: ExperienceClient) => {
  const { status, location } = await authorizeWithSession(client, {
    prompt: Prompt.Login,
    extraParams: { acr_values: firstFactorAcr },
  });

  expect(status).toBe(303);
  expect(location.startsWith('/step-up')).toBe(true);

  await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
};

devFeatureTest.describe('step-up route allow-list', () => {
  const userApi = new UserApiTest();
  const user = generateNewUserProfile({ username: true, password: true, primaryEmail: true });
  const newPassword = generateNewUserProfile({ password: true }).password;

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();
    await userApi.create(user);
  });

  afterAll(async () => {
    await clearConnectorsByTypes([ConnectorType.Email]);
    await userApi.cleanUp();
  });

  /** Sign in with the password so the session carries `acr=urn:logto:acr:1fa`. */
  const signInWithPassword = async ({ username, password }: typeof user) => {
    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);

    return client;
  };

  it('forbids every route outside the allow-list in pure step-up', async () => {
    const client = await signInWithPassword(user);
    await startStepUp(client);

    await expectForbidden(
      client.updateInteractionEvent({ interactionEvent: InteractionEvent.Register })
    );
    await expectForbidden(client.updateProfile({ type: 'password', value: newPassword }));
    await expectForbidden(client.skipMfaBinding());
    await expectForbidden(client.createTotpSecret());
    await expectForbidden(client.generateMfaBackupCodes());
    await expectForbidden(
      client.verifyOneTimeToken({
        token: 'one-time-token',
        identifier: { type: SignInIdentifier.Email, value: user.primaryEmail },
      })
    );
    await expectForbidden(
      client.createSignInPasskeyAuthentication({
        identifier: { type: SignInIdentifier.Username, value: user.username },
      })
    );
    await expectForbidden(
      client.getSocialAuthorizationUri('connector-id', {
        redirectUri: 'https://example.com/callback',
        state: 'state',
      })
    );
    await expectForbidden(
      client.getEnterpriseSsoAuthorizationUri('connector-id', {
        redirectUri: 'https://example.com/callback',
        state: 'state',
      })
    );

    await logoutClient(client);
  });

  it('does not restrict a SignIn with a requested ACR', async () => {
    const client = new ExperienceClient();
    const { status, location } = await authorizeWithSession(client, {
      extraParams: { acr_values: firstFactorAcr },
    });

    expect(status).toBe(303);
    expect(location.startsWith('/sign-in')).toBe(true);

    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
    await identifyUserWithUsernamePassword(client, user.username, user.password);

    // A route that is forbidden in pure step-up keeps its normal SignIn behavior.
    const response = await client.updateProfile({ type: 'extraProfile', values: {} });

    expect(response.status).toBe(204);
  });
});
