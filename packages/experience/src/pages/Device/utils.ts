import { oidcRoutes } from '@logto/schemas';
import type { To } from 'react-router-dom';

/**
 * These helpers stay local to the Device page because they are tightly coupled to the
 * oidc-provider bridge query. Extracting them here keeps the page component focused on
 * state transitions and rendering, without turning them into misleading global utils.
 */
export type DeviceFlowContext = {
  readonly xsrf: string;
  readonly inputCode?: string;
  readonly userCode?: string;
};

const deviceFlowSubmitPath: string = oidcRoutes.codeVerification;

export const normalizeDisplayValue = (value: string) => value.toUpperCase();

export const hasDeviceCodeValue = (value: string) => value.replaceAll(/\W/g, '').length > 0;

export const toNavigateUrl = (url: string): To => {
  const { pathname, search, hash } = new URL(url, window.location.origin);
  return { hash, pathname, search };
};

/**
 * `user_code` stays reserved for confirm mode so the page can keep using its presence as the
 * mode switch. Input-mode redisplay therefore travels through `input_code`, which only seeds
 * the visible input and must not change the page mode on its own.
 */
export const parseDeviceFlowContext = (
  searchParams: URLSearchParams
): DeviceFlowContext | undefined => {
  const xsrf = searchParams.get('xsrf');

  if (!xsrf) {
    return;
  }

  return {
    inputCode: searchParams.get('input_code') ?? undefined,
    userCode: searchParams.get('user_code') ?? undefined,
    xsrf,
  };
};

/**
 * The Experience page now reconstructs the provider request body locally instead of injecting the
 * provider HTML form into the DOM. `confirm=yes` stays in every submit so valid codes continue to
 * skip the intermediate confirm page and preserve the current one-step experience.
 */
export const createDeviceFlowRequestBody = ({
  userCode,
  xsrf,
}: {
  readonly userCode: string;
  readonly xsrf: string;
}) =>
  new URLSearchParams({
    confirm: 'yes',
    user_code: userCode,
    xsrf,
  });

/**
 * Submit the structured device-flow payload through fetch so the SPA can follow provider redirects
 * without falling back to a full-page browser form post. The submit target is shared with Core
 * through a schema constant, so the page does not need a bridge query just to learn a fixed path.
 */
export const submitDeviceFlowRequest = async (body: URLSearchParams) =>
  fetch(deviceFlowSubmitPath, {
    body,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

/**
 * Unexpected provider responses can still carry useful JSON payloads such as
 * `invalid_request`. Reading just the OAuth error code is enough for the page
 * to distinguish stale-session failures from generic submit errors.
 */
export const readDeviceFlowFailureError = async (
  response: Response
): Promise<string | undefined> => {
  try {
    const body: unknown = await response.clone().json();

    if (typeof body !== 'object' || body === null) {
      return undefined;
    }

    const error: unknown = Reflect.get(body, 'error');
    return typeof error === 'string' ? error : undefined;
  } catch {
    return undefined;
  }
};
