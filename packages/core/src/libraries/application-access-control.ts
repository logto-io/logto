import { isBuiltInApplicationId, type ApplicationAccessControl } from '@logto/schemas';

import { EnvSet } from '#src/env-set/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

const buildOrganizationRoleRuleMatches = ({
  organizationRoleRules,
}: ApplicationAccessControl): Array<{ organizationId: string; organizationRoleId: string }> =>
  organizationRoleRules.flatMap(({ organizationId, organizationRoleIds }) =>
    organizationRoleIds.map((organizationRoleId) => ({ organizationId, organizationRoleId }))
  );

const isApplicationNotFoundError = (error: unknown) =>
  error instanceof RequestError && error.code === 'entity.not_exists_with_id';

export const createApplicationAccessControlLibrary = (queries: Queries) => {
  const {
    applications: { findApplicationById },
    applicationAccessControl: { findApplicationAccessControl },
    usersRoles: { hasUserRole },
    organizations: {
      relations: { users: organizationUserRelations, usersRoles: organizationUserRoleRelations },
    },
  } = queries;

  const assertUserHasApplicationAccess = async (applicationId: string, userId: string) => {
    if (!EnvSet.values.isDevFeaturesEnabled || isBuiltInApplicationId(applicationId)) {
      return;
    }

    const { appLevelAccessControlEnabled } = await findApplicationById(applicationId).catch(
      (error: unknown) => {
        if (isApplicationNotFoundError(error)) {
          throw new RequestError('oidc.access_denied');
        }

        throw error;
      }
    );

    if (!appLevelAccessControlEnabled) {
      return;
    }

    const accessControl = await findApplicationAccessControl(applicationId);

    if (accessControl.userIds.includes(userId)) {
      return;
    }

    if (await hasUserRole(userId, accessControl.userRoleIds)) {
      return;
    }

    const organizationIds = await organizationUserRelations.getExistingOrganizationIds(
      userId,
      accessControl.organizationIds
    );

    if (organizationIds.length > 0) {
      return;
    }

    const organizationRoleRuleMatches = buildOrganizationRoleRuleMatches(accessControl);

    if (
      await organizationUserRoleRelations.hasUserOrganizationRole(
        userId,
        organizationRoleRuleMatches
      )
    ) {
      return;
    }

    throw new RequestError('oidc.access_denied');
  };

  return {
    assertUserHasApplicationAccess,
  };
};
