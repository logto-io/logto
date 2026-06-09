import { type ApplicationAccessControl, type FeaturedUser, type UserInfo } from '@logto/schemas';
import { conditional } from '@silverhand/essentials';
import { useCallback } from 'react';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';
import useBatchEntityDetailsFetch from '@/hooks/use-batch-entity-details-fetch';
import { buildUrl } from '@/utils/url';

import { buildOrganizationRoleRuleId } from './utils';

export type UsersPreview = {
  featuredUsers: FeaturedUser[];
  usersCount: number;
};

type MemberPreviewsResponse = {
  organizationMemberPreviews: Record<string, UsersPreview>;
  organizationRoleMemberPreviews: Record<string, UsersPreview>;
};

type OrganizationRoleRule = {
  organizationId: string;
  organizationRoleId: string;
};

type PreviewEntry = readonly [string, UsersPreview];

const memberPreviewPageSize = 3;
const emptyOrganizationIds: string[] = [];
const emptyOrganizationRoleRules: OrganizationRoleRule[] = [];

const getOrganizationRoleRules = ({ organizationRoleRules }: ApplicationAccessControl) =>
  organizationRoleRules.flatMap(({ organizationId, organizationRoleIds }) =>
    organizationRoleIds.map((organizationRoleId) => ({ organizationId, organizationRoleId }))
  );

const toFeaturedUser = ({ id, avatar, name }: UserInfo): FeaturedUser => ({
  id,
  avatar,
  name,
});

const useMemberPreviews = (accessControl: ApplicationAccessControl | undefined) => {
  const api = useApi();
  const fetchBatchEntityDetails = useBatchEntityDetailsFetch();
  const organizationIds = accessControl?.organizationIds ?? emptyOrganizationIds;
  const organizationRoleRules = accessControl
    ? getOrganizationRoleRules(accessControl)
    : emptyOrganizationRoleRules;
  const memberPreviewsKey =
    organizationIds.length > 0 || organizationRoleRules.length > 0
      ? JSON.stringify({ organizationIds, organizationRoleRules })
      : null;

  const fetchMemberPreviews = useCallback(async () => {
    const fetchOrganizationUsersPreview = async (
      organizationId: string,
      organizationRoleId?: string
    ) => {
      const response = await api.get(
        buildUrl(`api/organizations/${organizationId}/users`, {
          page: '1',
          page_size: String(memberPreviewPageSize),
          ...conditional(organizationRoleId && { organizationRoleId }),
        })
      );
      const users = await response.json<UserInfo[]>();

      return {
        featuredUsers: users.map((user) => toFeaturedUser(user)),
        usersCount: Number(response.headers.get('Total-Number') ?? 0),
      };
    };

    const [organizationPreviewEntries, organizationRolePreviewEntries] = await Promise.all([
      fetchBatchEntityDetails<PreviewEntry>(
        'api/organizations',
        organizationIds,
        async (organizationId) => [
          organizationId,
          await fetchOrganizationUsersPreview(organizationId),
        ]
      ),
      fetchBatchEntityDetails<PreviewEntry, OrganizationRoleRule>(
        'api/organizations',
        organizationRoleRules,
        async ({ organizationId, organizationRoleId }) => [
          buildOrganizationRoleRuleId(organizationId, organizationRoleId),
          await fetchOrganizationUsersPreview(organizationId, organizationRoleId),
        ]
      ),
    ]);

    return {
      organizationMemberPreviews: Object.fromEntries(organizationPreviewEntries),
      organizationRoleMemberPreviews: Object.fromEntries(organizationRolePreviewEntries),
    };
  }, [api, fetchBatchEntityDetails, organizationIds, organizationRoleRules]);

  const {
    data: memberPreviews,
    error,
    isLoading,
  } = useSWR<MemberPreviewsResponse, RequestError>(
    memberPreviewsKey ? ['application-access-control-member-previews', memberPreviewsKey] : null,
    fetchMemberPreviews
  );

  return {
    organizationMemberPreviews: memberPreviews?.organizationMemberPreviews ?? {},
    organizationRoleMemberPreviews: memberPreviews?.organizationRoleMemberPreviews ?? {},
    error,
    isLoading,
  };
};

export default useMemberPreviews;
