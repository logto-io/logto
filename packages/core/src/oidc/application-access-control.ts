import { errors, type InteractionResults } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';

export const appLevelAccessControlMetadataKey = 'appLevelAccessControlEnabled';

const appLevelAccessControlInteractionResultKey = 'appLevelAccessControl';

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const hasAppLevelAccessControlChecked = (
  result: unknown,
  applicationId: string,
  userId: string
) => {
  if (!isObjectRecord(result)) {
    return false;
  }

  const marker = result[appLevelAccessControlInteractionResultKey];

  if (!isObjectRecord(marker)) {
    return false;
  }

  return (
    marker.checked === true && marker.applicationId === applicationId && marker.userId === userId
  );
};

export const markAppLevelAccessControlChecked = (
  result: InteractionResults | undefined,
  applicationId: string,
  userId: string
): InteractionResults => ({
  ...result,
  [appLevelAccessControlInteractionResultKey]: {
    checked: true,
    applicationId,
    userId,
  },
});

export const markAppLevelAccessControlCheckedForOidcContext = (
  oidc: { result?: InteractionResults },
  applicationId: string,
  userId: string
) => {
  Reflect.set(oidc, 'result', markAppLevelAccessControlChecked(oidc.result, applicationId, userId));
};

/**
 * Use this wrapper for app-access checks inside oidc-provider hooks and grant handlers.
 * The application-access-control library throws Logto `RequestError`s, while oidc-provider
 * expects its own errors to produce the correct OAuth response.
 */
export const assertUserHasApplicationAccessForOidc = async (
  applicationAccessControl: Libraries['applicationAccessControl'],
  applicationId: string,
  userId: string,
  appLevelAccessControlEnabled?: boolean
) => {
  try {
    await applicationAccessControl.assertUserHasApplicationAccess(
      applicationId,
      userId,
      appLevelAccessControlEnabled
    );
  } catch (error: unknown) {
    if (error instanceof RequestError && error.code === 'oidc.access_denied') {
      throw new errors.AccessDenied(error.message);
    }

    throw error;
  }
};
