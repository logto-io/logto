import type { ApplicationAccessControl } from '@logto/schemas';

import RequestError from '#src/errors/RequestError/index.js';
import assertThat from '#src/utils/assert-that.js';

const hasApplicationAccessControlRules = ({
  userIds,
  userRoleIds,
  organizationIds,
  organizationRoleRules,
}: ApplicationAccessControl) =>
  userIds.length > 0 ||
  userRoleIds.length > 0 ||
  organizationIds.length > 0 ||
  organizationRoleRules.some(({ organizationRoleIds }) => organizationRoleIds.length > 0);

export const assertApplicationAccessControlHasRules = (accessControl: ApplicationAccessControl) => {
  assertThat(
    hasApplicationAccessControlRules(accessControl),
    new RequestError({
      code: 'request.invalid_input',
      status: 422,
      details:
        'Application access control must include at least one rule before it can be enabled.',
    })
  );
};
