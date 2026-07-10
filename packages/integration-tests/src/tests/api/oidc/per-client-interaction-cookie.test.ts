import { Prompt } from '@logto/js';
import { ApplicationType, InteractionEvent, type Application } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import { deleteUser } from '#src/api/admin-user.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import { createUserByAdmin } from '#src/helpers/index.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import {
  generatePassword,
  generateTestName,
  generateUsername,
  parseInteractionCookie,
} from '#src/utils.js';

const firstRedirectUri = 'https://first.example.com/callback';
const secondRedirectUri = 'https://second.example.com/callback';

const createClient = (applicationId: string) => {
  const client = new ExperienceClient({
    appId: applicationId,
    prompt: Prompt.Login,
    scopes: [],
  });

  // eslint-disable-next-line @silverhand/fp/no-mutation
  client.extraHeaders = { 'Logto-App-Id': applicationId };

  return client;
};

const startInteraction = async (client: ExperienceClient, redirectUri: string) => {
  const response = await client.startAuthorization(redirectUri);

  expect(response.status).toBe(303);
  expect(response.headers.get('location')?.startsWith('/sign-in')).toBe(true);

  client.mergeRawCookies(response.headers.getSetCookie());
  await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
};

describe('per-client interaction cookies', () => {
  const username = generateUsername();
  const password = generatePassword();
  // eslint-disable-next-line @silverhand/fp/no-let
  let firstApplication: Application;
  // eslint-disable-next-line @silverhand/fp/no-let
  let secondApplication: Application;
  // eslint-disable-next-line @silverhand/fp/no-let
  let userId = '';

  beforeAll(async () => {
    const [createdFirstApplication, createdSecondApplication, user] = await Promise.all([
      createApplication(generateTestName(), ApplicationType.SPA, {
        oidcClientMetadata: {
          redirectUris: [firstRedirectUri],
          postLogoutRedirectUris: [],
        },
      }),
      createApplication(generateTestName(), ApplicationType.SPA, {
        oidcClientMetadata: {
          redirectUris: [secondRedirectUri],
          postLogoutRedirectUris: [],
        },
      }),
      createUserByAdmin({ username, password }),
      enableAllPasswordSignInMethods(),
    ]);

    // eslint-disable-next-line @silverhand/fp/no-mutation
    firstApplication = createdFirstApplication;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    secondApplication = createdSecondApplication;
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = user.id;
  });

  afterAll(async () => {
    await Promise.all([
      deleteApplication(firstApplication.id),
      deleteApplication(secondApplication.id),
      deleteUser(userId),
    ]);
  });

  it('completes interleaved interactions for two applications sharing one cookie jar', async () => {
    const firstClient = createClient(firstApplication.id);
    await startInteraction(firstClient, firstRedirectUri);

    const secondClient = createClient(secondApplication.id);
    const secondAuthorizationResponse = await secondClient.startAuthorization(
      secondRedirectUri,
      {},
      firstClient.interactionCookie
    );
    expect(secondAuthorizationResponse.status).toBe(303);
    expect(secondAuthorizationResponse.headers.get('location')?.startsWith('/sign-in')).toBe(true);
    secondClient.assignRawCookies(firstClient.rawCookies);
    secondClient.mergeRawCookies(secondAuthorizationResponse.headers.getSetCookie());
    firstClient.mergeRawCookies(secondClient.rawCookies);
    await secondClient.initInteraction({ interactionEvent: InteractionEvent.SignIn });

    const interactionCookie = firstClient.parsedCookies.get('_interaction');
    assert(interactionCookie, new Error('No interaction found in shared cookie jar'));
    const interactionIds = parseInteractionCookie(interactionCookie);
    expect(interactionIds[firstApplication.id]).toEqual(expect.any(String));
    expect(interactionIds[secondApplication.id]).toEqual(expect.any(String));
    expect(interactionIds[firstApplication.id]).not.toBe(interactionIds[secondApplication.id]);

    await identifyUserWithUsernamePassword(firstClient, username, password);
    await identifyUserWithUsernamePassword(secondClient, username, password);

    const { redirectTo: firstRedirectTo } = await firstClient.submitInteraction();
    secondClient.mergeRawCookies(firstClient.rawCookies);
    const { redirectTo: secondRedirectTo } = await secondClient.submitInteraction();
    firstClient.mergeRawCookies(secondClient.rawCookies);

    await expect(processSession(firstClient, firstRedirectTo)).resolves.toBe(userId);
    secondClient.mergeRawCookies(firstClient.rawCookies);
    await expect(processSession(secondClient, secondRedirectTo)).resolves.toBe(userId);
  });

  it('keeps the default interaction cookie behavior without the app ID header', async () => {
    const client = await initExperienceClient({
      config: {
        appId: firstApplication.id,
        prompt: Prompt.Login,
        scopes: [],
      },
      redirectUri: firstRedirectUri,
    });
    const interactionCookie = client.parsedCookies.get('_interaction');
    assert(interactionCookie, new Error('No interaction found in cookie'));
    const interactionIds = parseInteractionCookie(interactionCookie);
    expect(interactionIds._legacy).toBe(interactionIds[firstApplication.id]);

    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();

    await expect(processSession(client, redirectTo)).resolves.toBe(userId);
  });
});
