import { errors } from 'oidc-provider';

import RequestError from '#src/errors/RequestError/index.js';
import type Libraries from '#src/tenants/Libraries.js';

/**
 * Use this wrapper for app-access checks inside oidc-provider hooks and grant handlers.
 * The application-access-control library throws Logto `RequestError`s, while oidc-provider
 * expects its own errors to produce the correct OAuth response.
 */
export const assertUserHasApplicationAccessForOidc = async (
  applicationAccessControl: Libraries['applicationAccessControl'],
  applicationId: string,
  userId: string
) => {
  try {
    await applicationAccessControl.assertUserHasApplicationAccess(applicationId, userId);
  } catch (error: unknown) {
    if (error instanceof RequestError && error.code === 'oidc.access_denied') {
      throw new errors.AccessDenied(error.message);
    }

    throw error;
  }
};
