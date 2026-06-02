import type { ApplicationAccessControl } from '@logto/schemas';

export const getOrganizationRoleRuleCount = ({ organizationRoleRules }: ApplicationAccessControl) =>
  organizationRoleRules.reduce(
    (count, { organizationRoleIds }) => count + organizationRoleIds.length,
    0
  );

export const hasApplicationAccessControlRules = ({
  userIds,
  userRoleIds,
  organizationIds,
  organizationRoleRules,
}: ApplicationAccessControl) =>
  userIds.length > 0 ||
  userRoleIds.length > 0 ||
  organizationIds.length > 0 ||
  getOrganizationRoleRuleCount({ userIds, userRoleIds, organizationIds, organizationRoleRules }) >
    0;
