import type { ApplicationAccessControl, User } from '@logto/schemas';

import { type SelectedDataEntry } from '@/ds-components/DataTransferBox/type';

type OrganizationRoleRuleEntry = {
  id: string;
  name: string;
  organizationId: string;
  organizationRoleId: string;
};

const normalizeStringArray = (values: string[]) => [...new Set(values)].slice().sort();

const areStringArraysEqual = (left: string[], right: string[]) => {
  const normalizedLeft = normalizeStringArray(left);
  const normalizedRight = normalizeStringArray(right);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every((value, index) => value === normalizedRight[index])
  );
};

const normalizeOrganizationRoleRules = (
  rules: ApplicationAccessControl['organizationRoleRules']
) => {
  const organizationRoleIdsByOrganizationId = new Map<string, Set<string>>();

  for (const { organizationId, organizationRoleIds } of rules) {
    const roleIds = organizationRoleIdsByOrganizationId.get(organizationId) ?? new Set<string>();

    for (const organizationRoleId of organizationRoleIds) {
      roleIds.add(organizationRoleId);
    }

    organizationRoleIdsByOrganizationId.set(organizationId, roleIds);
  }

  return [...organizationRoleIdsByOrganizationId.entries()]
    .slice()
    .sort(([leftOrganizationId], [rightOrganizationId]) =>
      leftOrganizationId.localeCompare(rightOrganizationId)
    )
    .map(([organizationId, organizationRoleIds]) => ({
      organizationId,
      organizationRoleIds: normalizeStringArray([...organizationRoleIds]),
    }));
};

const areOrganizationRoleRulesEqual = (
  left: ApplicationAccessControl['organizationRoleRules'],
  right: ApplicationAccessControl['organizationRoleRules']
) => {
  const normalizedLeft = normalizeOrganizationRoleRules(left);
  const normalizedRight = normalizeOrganizationRoleRules(right);

  return (
    normalizedLeft.length === normalizedRight.length &&
    normalizedLeft.every(
      ({ organizationId, organizationRoleIds }, index) =>
        organizationId === normalizedRight[index]?.organizationId &&
        areStringArraysEqual(organizationRoleIds, normalizedRight[index]?.organizationRoleIds ?? [])
    )
  );
};

export const areApplicationAccessControlsEqual = (
  left: ApplicationAccessControl,
  right: ApplicationAccessControl
) =>
  areStringArraysEqual(left.userIds, right.userIds) &&
  areStringArraysEqual(left.userRoleIds, right.userRoleIds) &&
  areStringArraysEqual(left.organizationIds, right.organizationIds) &&
  areOrganizationRoleRulesEqual(left.organizationRoleRules, right.organizationRoleRules);

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

export const buildOrganizationRoleRuleId = (organizationId: string, organizationRoleId: string) =>
  `${organizationId}:${organizationRoleId}`;

export const getOrganizationRoleRuleDisplayName = (
  organizationName: string,
  organizationRoleName: string
) => `${organizationName} - ${organizationRoleName}`;

export const getUserDisplayName = ({ name, primaryEmail, primaryPhone, username, id }: User) =>
  [name, primaryEmail, primaryPhone, username].find(Boolean) ?? id;

export const toOrganizationRoleRules = (
  selectedData: Array<SelectedDataEntry<OrganizationRoleRuleEntry>>
): ApplicationAccessControl['organizationRoleRules'] => {
  const organizationRoleIdsByOrganizationId = new Map<string, Set<string>>();

  for (const { organizationId, organizationRoleId } of selectedData) {
    const roleIds = organizationRoleIdsByOrganizationId.get(organizationId) ?? new Set<string>();
    roleIds.add(organizationRoleId);
    organizationRoleIdsByOrganizationId.set(organizationId, roleIds);
  }

  return [...organizationRoleIdsByOrganizationId.entries()]
    .slice()
    .sort(([leftOrganizationId], [rightOrganizationId]) =>
      leftOrganizationId.localeCompare(rightOrganizationId)
    )
    .map(([organizationId, organizationRoleIds]) => ({
      organizationId,
      organizationRoleIds: normalizeStringArray([...organizationRoleIds]),
    }));
};
