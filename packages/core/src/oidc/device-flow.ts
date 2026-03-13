import { deviceFlowXsrfCookieKey, experience } from '@logto/schemas';
import type { KoaContextWithOIDC, errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';

type DeviceFlowPageUrlOptions = {
  readonly inputCode?: string;
  readonly userCode?: string;
  readonly error?: string;
};

/**
 * Keep the device-code artifact lifetime aligned with oidc-provider's default behavior.
 * Exporting the value from the device-flow module keeps the TTL colocated with the feature
 * callbacks and avoids another magic number living inside the global OIDC init file.
 */
export const defaultDeviceCodeTtl = 10 * 60;
const deviceFlowCookiePath = `/${experience.routes.device}`;

const getDeviceFlowXsrf = (ctx: KoaContextWithOIDC): string => {
  const xsrf = ctx.oidc.session?.state?.secret;

  if (typeof xsrf !== 'string' || xsrf.length === 0) {
    throw new TypeError('Missing device flow xsrf state.');
  }

  return xsrf;
};

/**
 * The oidc-provider secret still lives in the server session, but the Experience SPA needs to
 * read it before posting back to `/oidc/device`. We keep it in a short-lived cookie instead of
 * the redirect URL so copied links, browser history, and logs do not expose the token.
 */
const setDeviceFlowXsrfCookie = (ctx: KoaContextWithOIDC) => {
  ctx.cookies.set(String(deviceFlowXsrfCookieKey), getDeviceFlowXsrf(ctx), {
    httpOnly: false,
    maxAge: defaultDeviceCodeTtl * 1000,
    overwrite: true,
    path: deviceFlowCookiePath,
    sameSite: 'lax',
  });
};

const clearDeviceFlowXsrfCookie = (ctx: KoaContextWithOIDC) => {
  ctx.cookies.set(String(deviceFlowXsrfCookieKey), '', {
    httpOnly: false,
    maxAge: 0,
    overwrite: true,
    path: deviceFlowCookiePath,
    sameSite: 'lax',
  });
};

const getDeviceFlowInputCode = (error?: Error | errors.OIDCProviderError): string | undefined => {
  if (!error || typeof error !== 'object' || !('userCode' in error)) {
    return;
  }

  return typeof error.userCode === 'string' ? error.userCode : undefined;
};

/**
 * Device-flow source callbacks already know the structured values the Experience page needs:
 * the session-bound xsrf secret and the visible code/error state. The submit target is now a
 * shared OIDC route constant, so the bridge query only needs to carry user-visible state.
 */
export const buildDeviceFlowPageUrl = ({
  inputCode,
  userCode,
  error,
}: DeviceFlowPageUrlOptions): string => {
  const searchParams = new URLSearchParams();

  if (userCode) {
    searchParams.append('user_code', userCode);
  } else if (inputCode) {
    /**
     * `user_code` remains reserved for confirm mode so the Experience page can keep using its
     * presence as the confirm-state signal. Input-mode error redisplay therefore uses a separate
     * query key that only seeds the visible field value.
     */
    searchParams.append('input_code', inputCode);
  }

  if (error) {
    searchParams.append('error', error);
  }

  const query = searchParams.toString();
  return query ? `/${experience.routes.device}?${query}` : `/${experience.routes.device}`;
};

/**
 * Success needs an absolute path because the provider callback runs under /oidc and should never
 * rely on relative redirect resolution.
 */
export const buildDeviceFlowSuccessPageUrl = (): string => `/${experience.routes.device}/success`;

/**
 * Device flow normally renders provider-owned HTML source pages. We redirect every state back into
 * the Experience SPA with a structured bridge query so input, error, and success all stay in one
 * UI shell without shipping raw provider HTML through the browser URL.
 */
export const deviceFlowConfig = {
  enabled: EnvSet.values.isDevFeaturesEnabled,
  userCodeInputSource: async (
    ctx: KoaContextWithOIDC,
    _form: string,
    _out: unknown,
    error?: Error | errors.OIDCProviderError
  ) => {
    setDeviceFlowXsrfCookie(ctx);
    ctx.redirect(
      buildDeviceFlowPageUrl({
        error: error?.name,
        inputCode: getDeviceFlowInputCode(error),
      })
    );
  },
  // eslint-disable-next-line max-params -- oidc-provider defines this callback signature.
  userCodeConfirmSource: async (
    ctx: KoaContextWithOIDC,
    _form: string,
    _client: unknown,
    _deviceInfo: unknown,
    userCode: string
  ) => {
    setDeviceFlowXsrfCookie(ctx);
    ctx.redirect(
      buildDeviceFlowPageUrl({
        userCode,
      })
    );
  },
  successSource: async (ctx: KoaContextWithOIDC) => {
    clearDeviceFlowXsrfCookie(ctx);
    ctx.redirect(buildDeviceFlowSuccessPageUrl());
  },
};
