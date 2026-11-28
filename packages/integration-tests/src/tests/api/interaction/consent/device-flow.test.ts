import { UserScope } from '@logto/core-kit';
import {
  ApplicationType,
  InteractionEvent,
  SignInIdentifier,
  deviceDemoAppApplicationId,
  deviceFlowXsrfCookieKey,
  oidcRoutes,
} from '@logto/schemas';
import ky, { type Options } from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { baseApi, oidcApi } from '#src/api/api.js';
import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { consent, getConsentInfo } from '#src/api/interaction.js';
import { createResource, deleteResource } from '#src/api/resource.js';
import { logtoConsoleUrl } from '#src/constants.js';
import { enableAllPasswordSignInMethods } from '#src/helpers/sign-in-experience.js';
import { generateNewUser } from '#src/helpers/user.js';

type DeviceAuthorizationResponse = {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
  expires_in: number;
};

type PasswordVerificationResponse = {
  verificationId: string;
};

type SubmitInteractionResponse = {
  redirectTo: string;
};

const isExpiredSetCookie = (setCookie: string) => {
  const lowerCased = setCookie.toLowerCase();
  return lowerCased.includes('max-age=0') || lowerCased.includes('expires=thu, 01 jan 1970');
};

const upsertCookie = (cookieJar: string[], setCookie: string) => {
  const cookieName = setCookie.split('=')[0];

  if (!cookieName) {
    return cookieJar;
  }

  const remaining = cookieJar.filter((cookie) => !cookie.startsWith(`${cookieName}=`));
  return isExpiredSetCookie(setCookie) ? remaining : [...remaining, setCookie];
};

const mergeCookies = (cookieJar: string[], response: Response) => {
  return response.headers
    .getSetCookie()
    .reduce((cookies, setCookie) => upsertCookie(cookies, setCookie), cookieJar);
};

const getCookieHeader = (cookieJar: string[]) => cookieJar.join('; ');

const getCookieValue = (cookieJar: string[], cookieName: string) =>
  cookieJar
    .map((cookie) => cookie.split(';')[0] ?? '')
    .find((cookie) => cookie.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);

const request = async (url: string, init: Options = {}, cookieJar: string[] = []) => {
  const requestOptions = {
    ...init,
    headers: {
      ...(cookieJar.length > 0 ? { cookie: getCookieHeader(cookieJar) } : {}),
      ...init.headers,
    },
    redirect: 'manual',
    throwHttpErrors: false,
  } satisfies Options;

  const response = await (url.startsWith('http://') || url.startsWith('https://')
    ? ky(url, requestOptions)
    : baseApi(url.replace(/^\//, ''), requestOptions));

  return {
    cookieJar: mergeCookies(cookieJar, response),
    response,
  };
};

const requestJson = async <T>(url: string, init: Options = {}, cookieJar: string[] = []) => {
  const { response, cookieJar: nextCookieJar } = await request(url, init, cookieJar);

  return {
    cookieJar: nextCookieJar,
    data: await response.json<T>(),
    response,
  };
};

const followRedirects = async (
  url: string,
  cookieJar: string[] = [],
  attempts = 10
): Promise<{ cookieJar: string[]; response: Response }> => {
  if (attempts <= 0) {
    throw new Error('Too many redirects while preparing the device flow consent test');
  }

  const { response, cookieJar: nextCookieJar } = await request(url, {}, cookieJar);
  const location = response.headers.get('location');

  if (!location || response.status < 300 || response.status >= 400) {
    return { cookieJar: nextCookieJar, response };
  }

  return followRedirects(location, nextCookieJar, attempts - 1);
};

const confirmDeviceCode = async (
  deviceAuthorization: DeviceAuthorizationResponse,
  cookieJar: string[] = []
) => {
  const { cookieJar: verificationCookieJar } = await followRedirects(
    deviceAuthorization.verification_uri,
    cookieJar
  );
  const deviceFlowXsrf = getCookieValue(verificationCookieJar, String(deviceFlowXsrfCookieKey));

  expect(deviceFlowXsrf).toBeTruthy();

  return request(
    oidcRoutes.codeVerification,
    {
      body: new URLSearchParams({
        confirm: 'yes',
        user_code: deviceAuthorization.user_code,
        xsrf: deviceFlowXsrf ?? '',
      }),
      method: 'POST',
    },
    verificationCookieJar
  );
};

const signInAndSubmitDeviceInteraction = async (
  signInCookieJar: string[],
  username: string,
  password: string
) => {
  const { cookieJar: interactionCookieJar } = await request(
    '/api/experience',
    { json: { interactionEvent: InteractionEvent.SignIn }, method: 'PUT' },
    signInCookieJar
  );
  const {
    cookieJar: passwordCookieJar,
    data: { verificationId },
  } = await requestJson<PasswordVerificationResponse>(
    '/api/experience/verification/password',
    {
      json: {
        identifier: { type: SignInIdentifier.Username, value: username },
        password,
      },
      method: 'POST',
    },
    interactionCookieJar
  );
  const { cookieJar: identifiedCookieJar } = await request(
    '/api/experience/identification',
    { json: { verificationId }, method: 'POST' },
    passwordCookieJar
  );
  const {
    cookieJar: submitCookieJar,
    data: { redirectTo },
  } = await requestJson<SubmitInteractionResponse>(
    '/api/experience/submit',
    { method: 'POST' },
    identifiedCookieJar
  );

  return request(redirectTo, {}, submitCookieJar);
};

describe('consent api for device flow', () => {
  beforeAll(async () => {
    await enableAllPasswordSignInMethods();
  });

  it('should allow third-party device flow consent without redirect_uri', async () => {
    const application = await createApplication(
      `device-flow-third-party-consent-${Date.now()}`,
      ApplicationType.Native,
      {
        isThirdParty: true,
        customClientMetadata: { isDeviceFlow: true },
      }
    );

    await assignUserConsentScopes(application.id, {
      userScopes: [UserScope.Profile],
    });

    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    try {
      const deviceAuthorization = await oidcApi
        .post('device/auth', {
          body: new URLSearchParams({
            client_id: application.id,
            scope: 'openid profile',
          }),
        })
        .json<DeviceAuthorizationResponse>();

      const { response: startSignInResponse, cookieJar: signInCookieJar } =
        await confirmDeviceCode(deviceAuthorization);

      expect(startSignInResponse.status).toBe(303);
      expect(startSignInResponse.headers.get('location')).toBe(`/sign-in?app_id=${application.id}`);

      const { response: consentRedirectResponse, cookieJar: consentCookieJar } =
        await signInAndSubmitDeviceInteraction(
          signInCookieJar,
          userProfile.username,
          userProfile.password
        );

      expect(consentRedirectResponse.status).toBe(303);
      expect(consentRedirectResponse.headers.get('location')).toBe(
        `/consent?app_id=${application.id}`
      );

      const consentInfo = await getConsentInfo(getCookieHeader(consentCookieJar));

      expect(consentInfo.application.id).toBe(application.id);
      expect(consentInfo.user.id).toBe(user.id);
      expect(consentInfo.missingOIDCScope).toEqual([UserScope.Profile]);
      expect(consentInfo.redirectUri).toBeUndefined();
    } finally {
      await Promise.all([deleteApplication(application.id), deleteUser(user.id)]);
    }
  });

  it('should reject device-demo-app device authorization on the admin endpoint with invalid_client', async () => {
    const response = await ky.post(new URL('/oidc/device/auth', logtoConsoleUrl), {
      body: new URLSearchParams({
        client_id: deviceDemoAppApplicationId,
        scope: 'openid',
      }),
      throwHttpErrors: false,
    });

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_client' });
  });

  it('should reject device-demo-app device authorization with an API resource as invalid_target', async () => {
    const resource = await createResource();

    try {
      const response = await oidcApi.post('device/auth', {
        body: new URLSearchParams({
          client_id: deviceDemoAppApplicationId,
          scope: 'openid',
          resource: resource.indicator,
        }),
        throwHttpErrors: false,
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({ error: 'invalid_target' });
    } finally {
      await deleteResource(resource.id);
    }
  });

  it('should reject disallowed OIDC scopes for device-demo-app with invalid_scope', async () => {
    const response = await oidcApi.post('device/auth', {
      body: new URLSearchParams({
        client_id: deviceDemoAppApplicationId,
        scope: `openid ${UserScope.Organizations}`,
      }),
      throwHttpErrors: false,
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: 'invalid_scope' });
  });

  it('should require explicit consent for device-demo-app on both initial and repeat authorizations', async () => {
    const { userProfile, user } = await generateNewUser({ username: true, password: true });

    try {
      const initialAuthorization = await oidcApi
        .post('device/auth', {
          body: new URLSearchParams({
            client_id: deviceDemoAppApplicationId,
            scope: 'openid offline_access profile email',
          }),
        })
        .json<DeviceAuthorizationResponse>();

      const { response: startSignInResponse, cookieJar: signInCookieJar } =
        await confirmDeviceCode(initialAuthorization);

      expect(startSignInResponse.status).toBe(303);
      expect(startSignInResponse.headers.get('location')).toBe(
        `/sign-in?app_id=${deviceDemoAppApplicationId}`
      );

      const { response: consentRedirectResponse, cookieJar: consentCookieJar } =
        await signInAndSubmitDeviceInteraction(
          signInCookieJar,
          userProfile.username,
          userProfile.password
        );

      expect(consentRedirectResponse.status).toBe(303);
      expect(consentRedirectResponse.headers.get('location')).toBe(
        `/consent?app_id=${deviceDemoAppApplicationId}`
      );

      const consentInfo = await getConsentInfo(getCookieHeader(consentCookieJar));

      expect(consentInfo.application.id).toBe(deviceDemoAppApplicationId);
      expect(consentInfo.user.id).toBe(user.id);
      expect(consentInfo.missingOIDCScope).toEqual(
        expect.arrayContaining([UserScope.Profile, UserScope.Email])
      );
      expect(consentInfo.redirectUri).toBeUndefined();

      const { redirectTo } = await consent(getCookieHeader(consentCookieJar));
      const { response: resumeResponse, cookieJar: sessionCookieJar } = await request(
        redirectTo,
        {},
        consentCookieJar
      );

      expect(resumeResponse.status).toBe(302);
      expect(resumeResponse.headers.get('location')).toBe('/device/success');

      // A second authorization on the same browser session must still prompt for consent.
      const repeatAuthorization = await oidcApi
        .post('device/auth', {
          body: new URLSearchParams({
            client_id: deviceDemoAppApplicationId,
            scope: 'openid offline_access profile email',
          }),
        })
        .json<DeviceAuthorizationResponse>();

      const { response: repeatConsentRedirectResponse, cookieJar: repeatConsentCookieJar } =
        await confirmDeviceCode(repeatAuthorization, sessionCookieJar);

      expect(repeatConsentRedirectResponse.status).toBe(303);
      expect(repeatConsentRedirectResponse.headers.get('location')).toBe(
        `/consent?app_id=${deviceDemoAppApplicationId}`
      );

      const repeatConsentInfo = await getConsentInfo(getCookieHeader(repeatConsentCookieJar));
      expect(repeatConsentInfo.application.id).toBe(deviceDemoAppApplicationId);
      expect(repeatConsentInfo.user.id).toBe(user.id);
    } finally {
      await deleteUser(user.id);
    }
  });
});
