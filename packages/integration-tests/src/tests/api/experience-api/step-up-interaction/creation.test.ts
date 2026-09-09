import { Prompt } from '@logto/node';
import { ConnectorType, InteractionEvent, MfaFactor, VerificationType } from '@logto/schemas';
import { maskEmail } from '@logto/shared';
import ky from 'ky';

import { createUserMfaVerification, updateUserLogtoConfig } from '#src/api/admin-user.js';
import { updateSignInExperience } from '#src/api/sign-in-experience.js';
import { ExperienceClient } from '#src/client/experience/index.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { clearConnectorsByTypes, setEmailConnector } from '#src/helpers/connector.js';
import {
  authorizeWithSession,
  expectRedirectedError,
} from '#src/helpers/experience/authorization.js';
import { identifyUserWithUsernamePassword } from '#src/helpers/experience/index.js';
import {
  enableAllPasswordSignInMethods,
  enableUserControlledMfaWithNoPrompt,
  resetMfaSettings,
} from '#src/helpers/sign-in-experience.js';
import { generateNewUserProfile, UserApiTest } from '#src/helpers/user.js';
import { devFeatureTest } from '#src/utils.js';

const firstFactorAcr = 'urn:logto:acr:1fa';
const mfaAcr = 'urn:logto:acr:mfa';

/** Follow the redirect Experience returned for a finished interaction and read where it lands. */
const followRedirect = async (client: ExperienceClient, redirectTo: string) => {
  const response = await ky.get(redirectTo, {
    headers: { cookie: client.getCookieHeader(new URL(redirectTo).pathname) },
    redirect: 'manual',
    throwHttpErrors: false,
  });

  return { status: response.status, location: response.headers.get('location') ?? '' };
};

/** Start a step-up authorization on the signed-in client and land on the step-up path. */
const startStepUp = async (client: ExperienceClient, acrValues: string, prompt?: Prompt) => {
  const { status, location } = await authorizeWithSession(client, {
    ...(prompt ? { prompt } : {}),
    extraParams: { acr_values: acrValues },
  });

  expect(status).toBe(303);
  expect(location.startsWith('/step-up')).toBe(true);
};

devFeatureTest.describe('step-up interaction creation', () => {
  const userApi = new UserApiTest();
  /** A password user with a primary email and an enrolled TOTP factor. */
  const totpUser = generateNewUserProfile({ username: true, password: true, primaryEmail: true });
  /** A password user with no primary identifier and no enrolled factor. */
  const passwordOnlyUser = generateNewUserProfile({ username: true, password: true });

  /** Sign in with the password so the session carries `acr=urn:logto:acr:1fa`. */
  const signInWithPassword = async ({ username, password }: typeof passwordOnlyUser) => {
    const client = await initExperienceClient();
    await identifyUserWithUsernamePassword(client, username, password);
    const { redirectTo } = await client.submitInteraction();
    await processSession(client, redirectTo);

    return client;
  };

  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
    await updateSignInExperience({ adaptiveMfa: { enabled: false } });
    // TOTP enabled without an enrollment prompt, so a user with no factor can sign in.
    await enableUserControlledMfaWithNoPrompt();
    await clearConnectorsByTypes([ConnectorType.Email]);
    await setEmailConnector();

    const [totpUserRecord] = await Promise.all([
      userApi.create(totpUser),
      userApi.create(passwordOnlyUser),
    ]);
    await createUserMfaVerification(totpUserRecord.id, MfaFactor.TOTP);
    // Let the password sign-in establish the session without a TOTP challenge; a requested `mfa`
    // ignores this preference, so the factor still has to be verified in the step-up.
    await updateUserLogtoConfig(totpUserRecord.id, {
      mfa: { skipMfaOnSignIn: true },
      passkeySignIn: {},
    });
  });

  afterAll(async () => {
    await resetMfaSettings();
    await clearConnectorsByTypes([ConnectorType.Email]);
    await userApi.cleanUp();
  });

  it('pins the subject and exposes the eligible methods for a reachable step-up', async () => {
    const client = await signInWithPassword(totpUser);
    await startStepUp(client, mfaAcr);

    await expect(
      client.initInteraction({ interactionEvent: InteractionEvent.SignIn })
    ).resolves.toBeUndefined();

    const expectedContext = {
      mode: 'stepUp',
      requestedAcrValues: [mfaAcr],
      selectedAcr: mfaAcr,
      // The session's `1fa` skips the first-factor prompt for a user with an MFA factor.
      availableMethods: [VerificationType.TOTP],
      establishableMethods: [],
      enrollableFactors: [],
      subjectProofConnectors: [],
      maskedIdentifiers: { email: maskEmail(totpUser.primaryEmail) },
    };
    const data = await client.getInteractionData();

    expect(data.interactionEvent).toBe(InteractionEvent.SignIn);
    // The subject is pinned but not yet verified, so it is not exposed as the identified user.
    expect(data.userId).toBeUndefined();
    expect(data.authenticationContext).toEqual(expectedContext);
    expect(JSON.stringify(data)).not.toContain(totpUser.primaryEmail);

    // A retry re-derives the same mode from the prompt details, and a refetch is stable.
    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });
    const refetched = await client.getInteractionData();

    expect(refetched.authenticationContext).toEqual(expectedContext);

    await logoutClient(client);
  });

  it('offers every method of the user when `1fa` is forced on a satisfied session', async () => {
    const client = await signInWithPassword(totpUser);
    await startStepUp(client, firstFactorAcr, Prompt.Login);
    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

    const { authenticationContext } = await client.getInteractionData();

    expect(authenticationContext).toMatchObject({
      mode: 'stepUp',
      selectedAcr: firstFactorAcr,
      availableMethods: [
        VerificationType.Password,
        VerificationType.EmailVerificationCode,
        VerificationType.TOTP,
      ],
      maskedIdentifiers: { email: maskEmail(totpUser.primaryEmail) },
    });

    await logoutClient(client);
  });

  it('finishes with unmet_authentication_requirements when the pinned user has no reachable method', async () => {
    const client = await signInWithPassword(passwordOnlyUser);
    await startStepUp(client, mfaAcr);

    const result = await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

    expect(result?.redirectTo).toEqual(expect.any(String));

    const { status, location } = await followRedirect(client, result!.redirectTo);

    expect(status).toBe(303);
    expectRedirectedError(location, 'unmet_authentication_requirements');

    await logoutClient(client);
  });

  it('rejects a pure step-up created with a non-sign-in event', async () => {
    const client = await signInWithPassword(totpUser);
    await startStepUp(client, mfaAcr);

    await expect(
      client.initInteraction({ interactionEvent: InteractionEvent.Register })
    ).rejects.toMatchObject({ response: { status: 400 } });

    await logoutClient(client);
  });

  it('stores a requested-only context without pinning a subject', async () => {
    const client = new ExperienceClient();
    const { status, location } = await authorizeWithSession(client, {
      extraParams: { acr_values: `${mfaAcr} ${firstFactorAcr}` },
    });

    expect(status).toBe(303);
    expect(location.startsWith('/sign-in')).toBe(true);

    await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

    const data = await client.getInteractionData();

    expect(data.userId).toBeUndefined();
    expect(data.authenticationContext).toEqual({
      requestedAcrValues: [mfaAcr, firstFactorAcr],
      availableMethods: [],
      establishableMethods: [],
      enrollableFactors: [],
      subjectProofConnectors: [],
      maskedIdentifiers: {},
    });
  });

  it('leaves a plain interaction unchanged', async () => {
    const client = await initExperienceClient();
    const data = await client.getInteractionData();

    expect(data.userId).toBeUndefined();
    expect(data).not.toHaveProperty('authenticationContext');
  });
});
