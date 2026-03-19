import { UserScope } from '@logto/core-kit';
import {
  ApplicationType,
  InteractionEvent,
  SignInIdentifier,
  deviceFlowXsrfCookieKey,
  oidcRoutes,
} from '@logto/schemas';
import ky, { type Options } from 'ky';

import { deleteUser } from '#src/api/admin-user.js';
import { assignUserConsentScopes } from '#src/api/application-user-consent-scope.js';
import { createApplication, deleteApplication } from '#src/api/application.js';
import { getConsentInfo } from '#src/api/interaction.js';
import { logtoUrl } from '#src/constants.js';
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

const upsertCookie = (cookieJar: string[], setCookie: string) => {
  const cookieName = setCookie.split('=')[0];

  if (!cookieName) {
    return cookieJar;
  }

  return [...cookieJar.filter((cookie) => !cookie.startsWith(`${cookieName}=`)), setCookie];
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
  const response = await ky(new URL(url, logtoUrl), {
    ...init,
    headers: {
      ...(cookieJar.length > 0 ? { cookie: getCookieHeader(cookieJar) } : {}),
      ...init.headers,
    },
    redirect: 'manual',
    throwHttpErrors: false,
  });

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
      const deviceAuthorization = await ky
        .post(new URL('/oidc/device/auth', logtoUrl), {
          body: new URLSearchParams({
            client_id: application.id,
            scope: 'openid profile',
          }),
        })
        .json<DeviceAuthorizationResponse>();

      const { cookieJar: verificationCookieJar } = await followRedirects(
        deviceAuthorization.verification_uri
      );
      const deviceFlowXsrf = getCookieValue(verificationCookieJar, String(deviceFlowXsrfCookieKey));

      expect(deviceFlowXsrf).toBeTruthy();

      const { response: startSignInResponse, cookieJar: signInCookieJar } = await request(
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

      expect(startSignInResponse.status).toBe(303);
      expect(startSignInResponse.headers.get('location')).toBe(`/sign-in?app_id=${application.id}`);

      const { cookieJar: interactionCookieJar } = await request(
        '/api/experience',
        {
          json: {
            interactionEvent: InteractionEvent.SignIn,
          },
          method: 'PUT',
        },
        signInCookieJar
      );

      const {
        cookieJar: passwordCookieJar,
        data: { verificationId },
      } = await requestJson<PasswordVerificationResponse>(
        '/api/experience/verification/password',
        {
          json: {
            identifier: {
              type: SignInIdentifier.Username,
              value: userProfile.username,
            },
            password: userProfile.password,
          },
          method: 'POST',
        },
        interactionCookieJar
      );

      const { cookieJar: identifiedCookieJar } = await request(
        '/api/experience/identification',
        {
          json: { verificationId },
          method: 'POST',
        },
        passwordCookieJar
      );

      const {
        cookieJar: submitCookieJar,
        data: { redirectTo },
      } = await requestJson<SubmitInteractionResponse>(
        '/api/experience/submit',
        {
          method: 'POST',
        },
        identifiedCookieJar
      );

      const { response: consentRedirectResponse, cookieJar: consentCookieJar } = await request(
        redirectTo,
        {},
        submitCookieJar
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
});
