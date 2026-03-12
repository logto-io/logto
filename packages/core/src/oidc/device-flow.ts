import { experience } from '@logto/schemas';
import type { KoaContextWithOIDC, errors } from 'oidc-provider';

import { EnvSet } from '#src/env-set/index.js';

type DeviceFlowPageUrlOptions = {
  readonly action: string;
  readonly xsrf: string;
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

const getDeviceFlowXsrf = (ctx: KoaContextWithOIDC): string => {
  const xsrf = ctx.oidc.session?.state?.secret;

  if (typeof xsrf !== 'string' || xsrf.length === 0) {
    throw new TypeError('Missing device flow xsrf state.');
  }

  return xsrf;
};

const getDeviceFlowInputCode = (error?: Error | errors.OIDCProviderError): string | undefined => {
  if (!error || typeof error !== 'object' || !('userCode' in error)) {
    return;
  }

  return typeof error.userCode === 'string' ? error.userCode : undefined;
};

/**
 * Device-flow submit must target the provider-owned verification endpoint, not the Experience SPA
 * route. We rely on oidc-provider's own route helper here so development proxies and mount paths
 * cannot accidentally turn the action back into a frontend-local `/device` post target.
 */
const getDeviceFlowAction = (ctx: KoaContextWithOIDC): string => {
  if (!ctx.oidc.urlFor) {
    throw new TypeError('Missing oidc device flow route helper.');
  }

  return ctx.oidc.urlFor('code_verification');
};

/**
 * Device-flow source callbacks already know the structured values the Experience page needs:
 * the verification action, the session-bound xsrf secret, and the visible code/error state.
 * Passing those fields directly keeps the bridge stateless without relying on provider HTML
 * parsing or shipping raw markup through the browser URL.
 */
export const buildDeviceFlowPageUrl = ({
  action,
  xsrf,
  inputCode,
  userCode,
  error,
}: DeviceFlowPageUrlOptions): string => {
  const searchParams = new URLSearchParams({
    action,
    xsrf,
  });

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

  return `/${experience.routes.device}?${searchParams.toString()}`;
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
    /**
     * Oidc-provider seeds `ctx.oidc.session.state.secret` immediately before invoking the
     * device source callbacks, so Experience can bridge the xsrf value directly from ctx
     * instead of reparsing it from provider-owned HTML.
     */
    const xsrf = getDeviceFlowXsrf(ctx);

    ctx.redirect(
      buildDeviceFlowPageUrl({
        action: getDeviceFlowAction(ctx),
        error: error?.name,
        inputCode: getDeviceFlowInputCode(error),
        xsrf,
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
    const xsrf = getDeviceFlowXsrf(ctx);

    ctx.redirect(
      buildDeviceFlowPageUrl({
        action: getDeviceFlowAction(ctx),
        userCode,
        xsrf,
      })
    );
  },
  successSource: async (ctx: KoaContextWithOIDC) => {
    ctx.redirect(buildDeviceFlowSuccessPageUrl());
  },
};
