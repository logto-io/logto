import { deviceFlowXsrfCookieKey, experience, logtoCookieKey } from '@logto/schemas';
import type { KoaContextWithOIDC, errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';

import {
  appendSharedExperienceSearchParams,
  buildSharedExperienceCookie,
  parseSharedExperienceParams,
  type SharedExperienceParams,
} from './utils.js';

type DeviceFlowPageState = Readonly<{
  readonly inputCode?: string;
  readonly userCode?: string;
  readonly error?: string;
}>;

type DeviceFlowPageUrlOptions = Readonly<{
  sharedParams?: SharedExperienceParams;
  state?: DeviceFlowPageState;
}>;

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
 * Device flow only replays the subset of Experience parameters that login and device pages truly
 * share: app, organization, and locale. Keeping that subset explicit avoids turning route-specific
 * login prompt parameters into accidental global state for the device page.
 */
const setDeviceFlowLogtoUiCookie = (
  ctx: KoaContextWithOIDC,
  sharedParams: SharedExperienceParams
) => {
  ctx.cookies.set(logtoCookieKey, JSON.stringify(buildSharedExperienceCookie(sharedParams)), {
    httpOnly: false,
    overwrite: true,
    sameSite: 'lax',
  });
};

/**
 * Device-flow source callbacks only send two buckets of state back to the Experience SPA:
 * shared cross-page params (app / organization / locale) and device-page state (code / error).
 * The xsrf secret is bridged separately through a short-lived cookie, so the page URL stays
 * focused on recoverable UI state rather than submission credentials.
 */
export const buildDeviceFlowPageUrl = ({
  sharedParams,
  state,
}: DeviceFlowPageUrlOptions): string => {
  const searchParams = new URLSearchParams();

  if (sharedParams) {
    appendSharedExperienceSearchParams(searchParams, sharedParams);
  }

  if (state?.userCode) {
    searchParams.append('user_code', state.userCode);
  } else if (state?.inputCode) {
    /**
     * `user_code` remains reserved for confirm mode so the Experience page can keep using its
     * presence as the confirm-state signal. Input-mode error redisplay therefore uses a separate
     * query key that only seeds the visible field value.
     */
    searchParams.append('input_code', state.inputCode);
  }

  if (state?.error) {
    searchParams.append('error', state.error);
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
 * UI shell without shipping raw provider HTML through the browser URL. The same redirect also
 * replays the shared app / organization / locale params so `/device` stays aligned with the rest
 * of Experience without inheriting login-only prompt parameters.
 */
export const deviceFlowConfig = {
  enabled: EnvSet.values.isDevFeaturesEnabled,
  userCodeInputSource: async (
    ctx: KoaContextWithOIDC,
    _form: string,
    _out: unknown,
    error?: Error | errors.OIDCProviderError
  ) => {
    const sharedParams = parseSharedExperienceParams(ctx.query);

    setDeviceFlowXsrfCookie(ctx);
    setDeviceFlowLogtoUiCookie(ctx, sharedParams);
    ctx.redirect(
      buildDeviceFlowPageUrl({
        sharedParams,
        state: {
          error: error?.name,
          inputCode: getDeviceFlowInputCode(error),
        },
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
    /**
     * DeviceCode params (the original device authorization request) carry `organization_id` and
     * `ui_locales` but never `app_id`, so only org/locale actually fall back here. `app_id` on
     * the Experience page is an explicit UI-context override supplied on the device page URL,
     * not an alias for the OIDC `client_id`. Query params win over DeviceCode params.
     */
    const sharedParams = {
      ...parseSharedExperienceParams(ctx.oidc.entities.DeviceCode?.params ?? {}),
      ...parseSharedExperienceParams(ctx.query),
    };

    setDeviceFlowXsrfCookie(ctx);
    setDeviceFlowLogtoUiCookie(ctx, sharedParams);
    ctx.redirect(
      buildDeviceFlowPageUrl({
        sharedParams,
        state: { userCode },
      })
    );
  },
  successSource: async (ctx: KoaContextWithOIDC) => {
    clearDeviceFlowXsrfCookie(ctx);
    ctx.redirect(buildDeviceFlowSuccessPageUrl());
  },
};
