import {
  CaptchaType,
  ExtraParamsKey,
  InteractionEvent,
  OneTimeTokenStatus,
  SignInIdentifier,
  SignInMode,
} from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import ky from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { deleteCaptchaProvider, updateCaptchaProvider } from '#src/api/captcha-provider.js';
import { updateSignInExperience } from '#src/api/index.js';
import {
  createOneTimeToken,
  getOneTimeTokenById,
  updateOneTimeTokenStatus,
  deleteOneTimeTokenById,
} from '#src/api/one-time-token.js';
import type { ExperienceClient } from '#src/client/experience/index.js';
import { demoAppRedirectUri, logtoUrl } from '#src/constants.js';
import { initExperienceClient, logoutClient, processSession } from '#src/helpers/client.js';
import { expectRejects } from '#src/helpers/index.js';
import { OrganizationApiTest } from '#src/helpers/organization.js';
import { generateNewUser } from '#src/helpers/user.js';
import { generateTestName, waitFor } from '#src/utils.js';

const { user, userProfile } = await generateNewUser({
  username: true,
  primaryEmail: true,
  password: true,
});

const signInWithPassword = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}) => {
  const client = await initExperienceClient({
    interactionEvent: InteractionEvent.SignIn,
  });

  const { verificationId } = await client.verifyPassword({
    identifier: {
      type: SignInIdentifier.Username,
      value: username,
    },
    password,
  });

  await client.identifyUser({ verificationId });
  const { redirectTo } = await client.submitInteraction();
  await processSession(client, redirectTo);

  return client;
};

const startOneTimeTokenAuthorization = async (
  client: ExperienceClient,
  email: string,
  token: string
) => {
  const response = await client.startAuthorization(
    demoAppRedirectUri,
    {
      extraParams: {
        [ExtraParamsKey.LoginHint]: email,
        [ExtraParamsKey.OneTimeToken]: token,
      },
    },
    client.interactionCookie
  );

  expect([302, 303]).toContain(response.status);
  expect(response.headers.get('location')).toBe('/consent?app_id=demo-app');
  client.mergeRawCookies(response.headers.getSetCookie());
};

const getConsentRedirectLocation = async (client: ExperienceClient) => {
  const response = await ky.get(`${logtoUrl}/consent`, {
    headers: {
      cookie: client.interactionCookie,
    },
    redirect: 'manual',
    throwHttpErrors: false,
  });

  expect([302, 303]).toContain(response.status);
  client.mergeRawCookies(response.headers.getSetCookie());
  const location = response.headers.get('location');
  assert(location, new Error('Missing consent redirect location'));

  return location;
};

const submitOneTimeTokenSignIn = async (client: ExperienceClient, email: string, token: string) => {
  await client.initInteraction({ interactionEvent: InteractionEvent.SignIn });

  const { verificationId } = await client.verifyOneTimeToken({
    token,
    identifier: { type: SignInIdentifier.Email, value: email },
  });

  await client.identifyUser({ verificationId });
  const { redirectTo } = await client.submitInteraction();

  return redirectTo;
};

const completeOneTimeTokenSignIn = async (
  client: ExperienceClient,
  email: string,
  token: string
) => {
  const redirectTo = await submitOneTimeTokenSignIn(client, email, token);

  return processSession(client, redirectTo);
};

describe('Sign-in interaction with one-time token', () => {
  beforeAll(async () => {
    await updateSignInExperience({
      sentinelPolicy: {},
    });
  });

  it('should successfully sign-in with a one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
    });

    await client.identifyUser({ verificationId });
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);

    expect(userId).toBe(user.id);

    await logoutClient(client);
    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should accept organization invitation when the magic link matches the active session user', async () => {
    const organizationApi = new OrganizationApiTest();
    const client = await signInWithPassword(userProfile);
    const organization = await organizationApi.create({ name: generateTestName() });
    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
      context: {
        jitOrganizationIds: [organization.id],
      },
    });

    try {
      await startOneTimeTokenAuthorization(client, userProfile.primaryEmail, oneTimeToken.token);

      const location = await getConsentRedirectLocation(client);
      expect(location).toContain(
        `one-time-token?login_hint=${encodeURIComponent(userProfile.primaryEmail)}`
      );
      expect(location).toContain(`one_time_token=${oneTimeToken.token}`);

      const userId = await completeOneTimeTokenSignIn(
        client,
        userProfile.primaryEmail,
        oneTimeToken.token
      );

      expect(userId).toBe(user.id);

      const organizations = await organizationApi.getUserOrganizations(user.id);
      expect(organizations.some(({ id }) => id === organization.id)).toBe(true);
      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Consumed,
      });
    } finally {
      await Promise.allSettled([
        logoutClient(client),
        deleteOneTimeTokenById(oneTimeToken.id),
        organizationApi.cleanUp(),
      ]);
    }
  });

  it('should complete switch-account magic link sign-in after token is consumed by the normal flow', async () => {
    const { user: activeUser, userProfile: activeUserProfile } = await generateNewUser({
      username: true,
      primaryEmail: true,
      password: true,
    });
    const client = await signInWithPassword(activeUserProfile);
    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    try {
      await startOneTimeTokenAuthorization(client, userProfile.primaryEmail, oneTimeToken.token);

      const location = await getConsentRedirectLocation(client);
      expect(location).toContain(
        `switch-account?login_hint=${encodeURIComponent(userProfile.primaryEmail)}`
      );
      expect(location).toContain(`one_time_token=${oneTimeToken.token}`);
      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Active,
      });

      const redirectTo = await submitOneTimeTokenSignIn(
        client,
        userProfile.primaryEmail,
        oneTimeToken.token
      );
      const userId = await processSession(client, redirectTo);

      expect(userId).toBe(user.id);
      await expect(getOneTimeTokenById(oneTimeToken.id)).resolves.toMatchObject({
        status: OneTimeTokenStatus.Consumed,
      });
    } finally {
      await Promise.allSettled([
        logoutClient(client),
        deleteUser(activeUser.id),
        deleteOneTimeTokenById(oneTimeToken.id),
      ]);
    }
  });

  it('should fail to sign-in with an invalid one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: 'invalid_token',
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_not_found',
        status: 404,
      }
    );
  });

  it('should fail to sign-in with an expired one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
      expiresIn: 1,
    });

    await waitFor(1001);

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_expired',
        status: 400,
      }
    );

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should fail to sign-in with a consumed one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
    });

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_consumed',
        status: 400,
      }
    );

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should fail to sign-in with a revoked one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    await updateOneTimeTokenStatus(oneTimeToken.id, OneTimeTokenStatus.Revoked);

    await expectRejects(
      client.verifyOneTimeToken({
        token: oneTimeToken.token,
        identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
      }),
      {
        code: 'one_time_token.token_revoked',
        status: 400,
      }
    );

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should sign-in the user even if the sign-in method does not support email', async () => {
    await updateSignInExperience({
      signInMode: SignInMode.SignIn,
      signUp: {
        identifiers: [SignInIdentifier.Username],
        password: true,
        verify: false,
      },
      signIn: {
        methods: [
          {
            identifier: SignInIdentifier.Username,
            password: true,
            verificationCode: false,
            isPasswordPrimary: true,
          },
        ],
      },
    });

    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
    });

    await client.identifyUser({ verificationId });

    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);

    expect(userId).toBe(user.id);

    await logoutClient(client);
    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should bypass the captcha check when using one-time token', async () => {
    const client = await initExperienceClient({
      interactionEvent: InteractionEvent.SignIn,
    });

    await updateCaptchaProvider({
      config: {
        type: CaptchaType.Turnstile,
        siteKey: 'site_key',
        secretKey: 'secret_key',
      },
    });

    const oneTimeToken = await createOneTimeToken({
      email: userProfile.primaryEmail,
    });

    const { verificationId } = await client.verifyOneTimeToken({
      token: oneTimeToken.token,
      identifier: { type: SignInIdentifier.Email, value: userProfile.primaryEmail },
    });

    await client.identifyUser({ verificationId });
    const { redirectTo } = await client.submitInteraction();
    const userId = await processSession(client, redirectTo);

    expect(userId).toBe(user.id);

    await Promise.all([
      logoutClient(client),
      deleteCaptchaProvider(),
      deleteUser(userId),
      deleteOneTimeTokenById(oneTimeToken.id),
    ]);
  });
});
