/**
 * These helpers stay local to the Device page because they are tightly coupled to the
 * oidc-provider bridge query. Extracting them here keeps the page component focused on
 * state transitions and rendering, without turning them into misleading global utils.
 */
export type DeviceFlowContext = {
  readonly action: string;
  readonly xsrf: string;
  readonly inputCode?: string;
  readonly userCode?: string;
};

export const normalizeDisplayValue = (value: string) => value.toUpperCase();

export const hasDeviceCodeValue = (value: string) => value.replaceAll(/\W/g, '').length > 0;

export const toNavigateUrl = (url: string) => {
  const { pathname, search, hash } = new URL(url, window.location.origin);
  return `${pathname}${search}${hash}`;
};

/**
 * `user_code` stays reserved for confirm mode so the page can keep using its presence as the
 * mode switch. Input-mode redisplay therefore travels through `input_code`, which only seeds
 * the visible input and must not change the page mode on its own.
 */
export const parseDeviceFlowContext = (
  searchParams: URLSearchParams
): DeviceFlowContext | undefined => {
  const action = searchParams.get('action');
  const xsrf = searchParams.get('xsrf');

  if (!action || !xsrf) {
    return;
  }

  return {
    action,
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
 * without falling back to a full-page browser form post.
 */
export const submitDeviceFlowRequest = async ({
  action,
  body,
}: {
  readonly action: string;
  readonly body: URLSearchParams;
}) =>
  fetch(action, {
    body,
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });
