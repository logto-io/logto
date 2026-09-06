import { Prompt, type SignInOptions } from '@logto/node';
import { InteractionEvent, defaultTenantId, demoAppApplicationId } from '@logto/schemas';
import { assert, assertEnv } from '@silverhand/essentials';
import { createInterceptorsPreset, createPool, sql, type DatabasePool } from '@silverhand/slonik';
import ky from 'ky';

import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { demoAppRedirectUri } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  enableAllPasswordSignInMethods,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest, parseInteractionCookie } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';
const mfaAcr = 'urn:logto:acr:mfa';
const unsupportedAcr = 'urn:logto:acr:2fa';
const unmetError = 'unmet_authentication_requirements';

type LoginPrompt = {
  name: string;
  reasons: string[];
  details: Record<string, unknown>;
};

type InteractionPayload = {
  prompt: LoginPrompt;
  session?: { accountId?: string };
};

/** Start an authorization on the client's current cookie jar and merge the cookies it sets. */
const authorize = async (
  client: ExperienceClient,
  options: Omit<SignInOptions, 'redirectUri'> = {}
) => {
  const response = await client.startAuthorization(
    demoAppRedirectUri,
    options,
    client.getCookieHeader('/oidc/auth')
  );
  const setCookies = response.headers.getSetCookie();
  client.mergeRawCookies(setCookies);

  return { status: response.status, location: response.headers.get('location') ?? '', setCookies };
};

/** The id of the interaction the authorization response just started. */
const getInteractionId = (setCookies: string[]) => {
  const interactionCookie = setCookies
    .map((cookie) => cookie.split(';')[0]?.trim() ?? '')
    .find((cookie) => cookie.startsWith('_interaction='));
  assert(interactionCookie, new Error('No interaction cookie was set'));
  const interactionId = parseInteractionCookie(interactionCookie.slice('_interaction='.length))[
    demoAppApplicationId
  ];
  assert(interactionId, new Error('No interaction id for the demo app'));

  return interactionId;
};

const expectRedirectedError = (location: string, error: string) => {
  expect(location.startsWith(demoAppRedirectUri)).toBe(true);
  expect(new URL(location).searchParams.get('error')).toBe(error);
  expect(new URL(location).searchParams.has('code')).toBe(false);
};

const expectAuthorizationCode = (location: string) => {
  expect(location.startsWith(demoAppRedirectUri)).toBe(true);
  expect(new URL(location).searchParams.get('code')).toEqual(expect.any(String));
  expect(new URL(location).searchParams.has('error')).toBe(false);
};

devFeatureTest.describe('acr_values and max_age interaction policy', () => {
  const userApi = new UserApiTest();
  const { username, password } = generateNewUserProfile({ username: true, password: true });
  // eslint-disable-next-line @silverhand/fp/no-let -- The user id and database connection are shared by the fixtures and assertions.
  let userId = '';
  // eslint-disable-next-line @silverhand/fp/no-let
  let pool: DatabasePool;

  const findInteraction = async (interactionId: string) => {
    const { payload } = await pool.one<{ payload: InteractionPayload }>(sql`
      select payload from oidc_model_instances
      where tenant_id = ${defaultTenantId} and model_name = 'Interaction' and id = ${interactionId}
    `);

    return payload;
  };

  /** Sign in with the password so the session carries `acr=urn:logto:acr:1fa`. */
  const signInWithPassword = async () => {
    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);

    return client;
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
    const user = await userApi.create({ username, password });
    // eslint-disable-next-line @silverhand/fp/no-mutation
    userId = user.id;
    // eslint-disable-next-line @silverhand/fp/no-mutation -- Initialize the connection after Jest has loaded the test environment.
    pool = await createPool(assertEnv('DB_URL'), { interceptors: createInterceptorsPreset() });
  });

  afterAll(async () => {
    await resetMfaSettings();
    await userApi.cleanUp();
    await pool.end();
  });

  it('issues an authorization code without interaction when the session satisfies the request', async () => {
    const client = await signInWithPassword();

    // The session's `1fa` satisfies the weaker class of an ordered list without consulting the
    // user's enrolled factors, and a request for `1fa` alone succeeds as well.
    for (const acrValues of [firstFactorAcr, `${mfaAcr} ${firstFactorAcr}`]) {
      // eslint-disable-next-line no-await-in-loop -- Each authorization reuses the same session.
      const { status, location } = await authorize(client, {
        prompt: Prompt.None,
        extraParams: { acr_values: acrValues, max_age: '600' },
      });

      expect(status).toBe(303);
      expectAuthorizationCode(location);
    }

    await logoutClient(client);
  });

  it('routes an unmet request on an authenticated session to the step-up path', async () => {
    const client = await signInWithPassword();
    const { status, location, setCookies } = await authorize(client, {
      extraParams: { acr_values: `${unsupportedAcr} ${mfaAcr} ${firstFactorAcr}` },
    });

    expect(status).toBe(303);
    expect(location).toBe(`/step-up?app_id=${demoAppApplicationId}`);

    const { prompt, session } = await findInteraction(getInteractionId(setCookies));
    expect(prompt.name).toBe('login');
    expect(prompt.reasons).toEqual(['acr_unmet']);
    expect(prompt.details.authenticationContext).toEqual({
      requestedAcrValues: [mfaAcr, firstFactorAcr],
      selectedAcr: mfaAcr,
      mode: 'stepUp',
    });
    // The session subject is available to Experience for pinning.
    expect(session?.accountId).toBe(userId);

    await logoutClient(client);
  });

  it('keeps the sign-in url and carries only the requested values without a session', async () => {
    const client = new ExperienceClient();
    const { status, location, setCookies } = await authorize(client, {
      extraParams: { acr_values: `${mfaAcr} ${firstFactorAcr}`, max_age: '600' },
    });

    expect(status).toBe(303);
    expect(location).toBe(`/sign-in?app_id=${demoAppApplicationId}`);

    const { prompt } = await findInteraction(getInteractionId(setCookies));
    expect(prompt.name).toBe('login');
    expect(prompt.reasons).not.toContain('acr_unmet');
    expect(prompt.reasons).toContain('no_session');
    expect(prompt.details.authenticationContext).toEqual({
      requestedAcrValues: [mfaAcr, firstFactorAcr],
    });
  });

  it.each<{ name: string; options: Omit<SignInOptions, 'redirectUri'> }>([
    { name: 'max_age=0', options: { extraParams: { acr_values: firstFactorAcr, max_age: '0' } } },
    {
      name: 'prompt=login',
      options: { prompt: Prompt.Login, extraParams: { acr_values: firstFactorAcr } },
    },
  ])('forces a step-up interaction with $name on a satisfied session', async ({ options }) => {
    const client = await signInWithPassword();
    const { status, location, setCookies } = await authorize(client, options);

    expect(status).toBe(303);
    expect(location).toBe(`/step-up?app_id=${demoAppApplicationId}`);

    const { prompt } = await findInteraction(getInteractionId(setCookies));
    expect(prompt.reasons).toEqual(['acr_unmet', 'login_prompt']);
    expect(prompt.details.authenticationContext).toEqual({
      requestedAcrValues: [firstFactorAcr],
      selectedAcr: firstFactorAcr,
      mode: 'stepUp',
    });

    await logoutClient(client);
  });

  it('fails with unmet_authentication_requirements when no requested value is supported', async () => {
    const anonymous = new ExperienceClient();
    const anonymousResponse = await authorize(anonymous, {
      extraParams: { acr_values: `${unsupportedAcr} phr` },
    });
    expect(anonymousResponse.status).toBe(303);
    expectRedirectedError(anonymousResponse.location, unmetError);

    const client = await signInWithPassword();
    const response = await authorize(client, { extraParams: { acr_values: unsupportedAcr } });
    expect(response.status).toBe(303);
    expectRedirectedError(response.location, unmetError);

    await logoutClient(client);
  });

  it('answers prompt=none with unmet_authentication_requirements on an unmet session and login_required without one', async () => {
    const client = await signInWithPassword();
    const unmetAcr = await authorize(client, {
      prompt: Prompt.None,
      extraParams: { acr_values: mfaAcr },
    });
    expectRedirectedError(unmetAcr.location, unmetError);

    // The freshness requirement fails the same way, ahead of the provider's `max_age` error.
    const staleSession = await authorize(client, {
      prompt: Prompt.None,
      extraParams: { acr_values: firstFactorAcr, max_age: '0' },
    });
    expectRedirectedError(staleSession.location, unmetError);

    const anonymous = new ExperienceClient();
    const noSession = await authorize(anonymous, {
      prompt: Prompt.None,
      extraParams: { acr_values: firstFactorAcr },
    });
    expectRedirectedError(noSession.location, 'login_required');

    await logoutClient(client);
  });

  it('fails after the interaction resumes with an insufficient context instead of prompting again', async () => {
    // A password sign-in achieves `1fa` only; Experience does not yet enforce the requested class,
    // so the policy is what stops the request from issuing a token with insufficient assurance.
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
      options: { extraParams: { acr_values: mfaAcr } },
    });
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();

    const response = await ky.get(redirectTo, {
      headers: { cookie: client.getCookieHeader(new URL(redirectTo).pathname) },
      redirect: 'manual',
      throwHttpErrors: false,
    });

    expect(response.status).toBe(303);
    expectRedirectedError(response.headers.get('location') ?? '', unmetError);
  });

  it('leaves a request without acr_values unchanged', async () => {
    const client = await signInWithPassword();

    const silent = await authorize(client, { prompt: Prompt.None });
    expectAuthorizationCode(silent.location);

    // A stale session still lands on the regular sign-in page, not the step-up path.
    const reauthentication = await authorize(client, { extraParams: { max_age: '0' } });
    expect(reauthentication.status).toBe(303);
    expect(reauthentication.location).toBe(`/sign-in?app_id=${demoAppApplicationId}`);

    const { prompt } = await findInteraction(getInteractionId(reauthentication.setCookies));
    expect(prompt.reasons).toEqual(['login_prompt']);
    expect(prompt.details).not.toHaveProperty('authenticationContext');

    await logoutClient(client);
  });
});
