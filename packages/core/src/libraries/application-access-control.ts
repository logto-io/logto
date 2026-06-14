import { isBuiltInApplicationId } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

const isApplicationNotFoundError = (error: unknown) =>
  error instanceof RequestError && error.code === 'entity.not_exists_with_id';

export const createApplicationAccessControlLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById },
    applicationAccessControl: { hasUserApplicationAccess },
  } = queries;

  const findAppLevelAccessControlEnabled = async (applicationId: string) => {
    try {
      const { appLevelAccessControlEnabled } = await findApplicationById(applicationId);

      return appLevelAccessControlEnabled;
    } catch (error: unknown) {
      if (isApplicationNotFoundError(error)) {
        throw new RequestError('oidc.access_denied');
      }

      throw error;
    }
  };

  const assertUserHasApplicationAccess = async (
    applicationId: string,
    userId: string,
    appLevelAccessControlEnabled?: boolean
  ) => {
    if (isBuiltInApplicationId(applicationId)) {
      return;
    }

    const isEnabled =
      appLevelAccessControlEnabled ?? (await findAppLevelAccessControlEnabled(applicationId));

    if (!isEnabled) {
      return;
    }

    if (await hasUserApplicationAccess(applicationId, userId)) {
      return;
    }

    throw new RequestError('oidc.access_denied');
  };

  return {
    assertUserHasApplicationAccess,
  };
};
