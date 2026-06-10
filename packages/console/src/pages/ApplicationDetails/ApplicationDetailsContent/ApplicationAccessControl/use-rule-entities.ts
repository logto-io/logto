import {
  type ApplicationAccessControl,
  type Organization,
  type OrganizationRole,
  type Role,
  type User,
  type UserInfo,
} from '@logto/schemas';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import useBatchEntityDetailsFetch from '@/hooks/use-batch-entity-details-fetch';
import { buildUrl } from '@/utils/url';

import useMemberPreviews, { type UsersPreview } from './use-member-previews';
import {
  getOrganizationRoleRuleDisplayName,
  getOrganizationRoleRuleCount,
  getUserDisplayName,
} from './utils';

const useEntitiesByIds = <TEntity>(key: string, pathname: string, ids: string[] | undefined) => {
  const fetchBatchEntityDetails = useBatchEntityDetailsFetch();

  const fetchEntitiesByIds = useCallback(
    async ([, entityIds]: readonly [string, string[]]) =>
      fetchBatchEntityDetails<TEntity>(pathname, entityIds),
    [fetchBatchEntityDetails, pathname]
  );

  return useSWR<TEntity[], RequestError>(
    ids && ids.length > 0 ? [key, ids] : null,
    fetchEntitiesByIds
  );
};

const getUniqueOrganizationRoleRuleIds = ({ organizationRoleRules }: ApplicationAccessControl) => [
  ...new Set(organizationRoleRules.flatMap(({ organizationRoleIds }) => organizationRoleIds)),
];

const getOrganizationRoleRuleOrganizationIds = ({
  organizationRoleRules,
}: ApplicationAccessControl) => [
  ...new Set(organizationRoleRules.map(({ organizationId }) => organizationId)),
];

export type RuleEntities = {
  users: User[];
  userRoles: Role[];
  organizations: Organization[];
  organizationRoleRuleOrganizations: Organization[];
  organizationRoleRules: OrganizationRole[];
  roleUserPreviews: Record<string, UsersPreview>;
  organizationMemberPreviews: Record<string, UsersPreview>;
  organizationRoleMemberPreviews: Record<string, UsersPreview>;
  hasError: boolean;
  isLoading: {
    users: boolean;
    userRoles: boolean;
    organizations: boolean;
    roleUserPreviews: boolean;
    memberPreviews: boolean;
    organizationRoleRules: boolean;
  };
  selectedNames: {
    users: string[];
    userRoles: string[];
    organizations: string[];
    organizationRoleRules: string[];
  };
};

const isLoadingIds = (
  ids: string[] | undefined,
  data: unknown | undefined,
  error: RequestError | undefined
) => Boolean(ids?.length && !data && !error);

const hasAnyRequestError = (...errors: Array<RequestError | undefined>) => errors.some(Boolean);

type OrganizationRoleRulesLoadingPayload = {
  accessControl: ApplicationAccessControl | undefined;
  organizationRoleRuleOrganizations: Organization[] | undefined;
  organizationRoleRules: OrganizationRole[] | undefined;
  organizationRoleRuleOrganizationsError: RequestError | undefined;
  organizationRoleRulesError: RequestError | undefined;
};

const isLoadingOrganizationRoleRules = ({
  accessControl,
  organizationRoleRuleOrganizations,
  organizationRoleRules,
  organizationRoleRuleOrganizationsError,
  organizationRoleRulesError,
}: OrganizationRoleRulesLoadingPayload) =>
  Boolean(
    accessControl &&
      getOrganizationRoleRuleCount(accessControl) > 0 &&
      ((!organizationRoleRuleOrganizations && !organizationRoleRuleOrganizationsError) ||
        (!organizationRoleRules && !organizationRoleRulesError))
  );

const previewPageSize = 3;

const toFeaturedUser = ({ id, avatar, name }: UserInfo): UsersPreview['featuredUsers'][number] => ({
  id,
  avatar,
  name,
});

const useRoleUserPreviewsByRoleIds = (roleIds: string[] | undefined) => {
  const api = useApi();

  const fetchRoleUserPreviews = useCallback(
    async ([, ids]: readonly [string, string[]]) => {
      const entries = await Promise.all(
        ids.map(async (roleId): Promise<readonly [string, UsersPreview]> => {
          const response = await api.get(
            buildUrl(`api/roles/${roleId}/users`, {
              page: '1',
              page_size: String(previewPageSize),
            })
          );
          const users = await response.json<UserInfo[]>();

          return [
            roleId,
            {
              featuredUsers: users.map((user) => toFeaturedUser(user)),
              usersCount: Number(response.headers.get('Total-Number') ?? 0),
            },
          ];
        })
      );

      return Object.fromEntries(entries);
    },
    [api]
  );

  return useSWR<Record<string, UsersPreview>, RequestError>(
    roleIds && roleIds.length > 0
      ? ['application-access-control-role-user-previews', roleIds]
      : null,
    fetchRoleUserPreviews
  );
};

function useRuleEntities(accessControl?: ApplicationAccessControl): RuleEntities {
  const userIds = accessControl?.userIds;
  const userRoleIds = accessControl?.userRoleIds;
  const organizationIds = accessControl?.organizationIds;
  const organizationRoleRuleOrganizationIds =
    accessControl && getOrganizationRoleRuleOrganizationIds(accessControl);
  const organizationRoleIds = accessControl && getUniqueOrganizationRoleRuleIds(accessControl);
  const { data: users, error: usersError } = useEntitiesByIds<User>(
    'application-access-control-users',
    'api/users',
    userIds
  );
  const { data: userRoles, error: userRolesError } = useEntitiesByIds<Role>(
    'application-access-control-user-roles',
    'api/roles',
    userRoleIds
  );
  const { data: organizations, error: organizationsError } = useEntitiesByIds<Organization>(
    'application-access-control-organizations',
    'api/organizations',
    organizationIds
  );
  const { data: organizationRoleRuleOrganizations, error: organizationRoleRuleOrganizationsError } =
    useEntitiesByIds<Organization>(
      'application-access-control-organization-role-rule-organizations',
      'api/organizations',
      organizationRoleRuleOrganizationIds
    );
  const { data: organizationRoleRules, error: organizationRoleRulesError } =
    useEntitiesByIds<OrganizationRole>(
      'application-access-control-organization-role-rules',
      'api/organization-roles',
      organizationRoleIds
    );
  const { data: roleUserPreviews, error: roleUserPreviewsError } =
    useRoleUserPreviewsByRoleIds(userRoleIds);
  const {
    organizationMemberPreviews,
    organizationRoleMemberPreviews,
    error: memberPreviewsError,
    isLoading: isMemberPreviewsLoading,
  } = useMemberPreviews(accessControl);

  const hasError = hasAnyRequestError(
    usersError,
    userRolesError,
    organizationsError,
    organizationRoleRuleOrganizationsError,
    organizationRoleRulesError,
    roleUserPreviewsError,
    memberPreviewsError
  );

  const selectedNames = useMemo(() => {
    const organizationsById = new Map(
      organizationRoleRuleOrganizations?.map((organization) => [organization.id, organization])
    );
    const organizationRolesById = new Map(
      organizationRoleRules?.map((organizationRole) => [organizationRole.id, organizationRole])
    );

    return {
      users: users?.map(getUserDisplayName) ?? [],
      userRoles: userRoles?.map(({ name }) => name) ?? [],
      organizations: organizations?.map(({ name }) => name) ?? [],
      organizationRoleRules:
        accessControl?.organizationRoleRules.flatMap(({ organizationId, organizationRoleIds }) => {
          const organization = organizationsById.get(organizationId);

          if (!organization) {
            return [];
          }

          return organizationRoleIds.flatMap((organizationRoleId) => {
            const organizationRole = organizationRolesById.get(organizationRoleId);

            return organizationRole
              ? [getOrganizationRoleRuleDisplayName(organization.name, organizationRole.name)]
              : [];
          });
        }) ?? [],
    };
  }, [
    accessControl?.organizationRoleRules,
    organizationRoleRuleOrganizations,
    organizationRoleRules,
    organizations,
    userRoles,
    users,
  ]);

  return {
    users: users ?? [],
    userRoles: userRoles ?? [],
    organizations: organizations ?? [],
    organizationRoleRuleOrganizations: organizationRoleRuleOrganizations ?? [],
    organizationRoleRules: organizationRoleRules ?? [],
    roleUserPreviews: roleUserPreviews ?? {},
    organizationMemberPreviews,
    organizationRoleMemberPreviews,
    hasError,
    isLoading: {
      users: isLoadingIds(userIds, users, usersError),
      userRoles: isLoadingIds(userRoleIds, userRoles, userRolesError),
      organizations: isLoadingIds(organizationIds, organizations, organizationsError),
      roleUserPreviews: isLoadingIds(userRoleIds, roleUserPreviews, roleUserPreviewsError),
      memberPreviews: isMemberPreviewsLoading,
      organizationRoleRules: isLoadingOrganizationRoleRules({
        accessControl,
        organizationRoleRuleOrganizations,
        organizationRoleRules,
        organizationRoleRuleOrganizationsError,
        organizationRoleRulesError,
      }),
    },
    selectedNames,
  };
}

export default useRuleEntities;
