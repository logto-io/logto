import { type User } from '@logto/schemas';
import { useCallback } from 'react';
import useSWR from 'swr';

import { adminTenantEndpoint, meApi } from '@/consts';
import { isCloud, isDevFeaturesEnabled } from '@/consts/env';

import { useStaticApi, type RequestError } from './use-api';
import useSwrFetcher from './use-swr-fetcher';

type TenantMfa = {
  /** Whether every member must set up MFA to sign in to Console. */
  isMfaRequired: boolean;
  /** Whether the current user has MFA configured. */
  hasMfaConfigured: boolean;
  /** Whether the current user is a member of the tenant, i.e. whether the requirement applies. */
  isMember: boolean;
  /** Whether the current user is an admin of the tenant, i.e. whether they can change it. */
  isAdmin: boolean;
};

type MemberWithoutMfa = Pick<User, 'id' | 'username' | 'primaryEmail' | 'name' | 'avatar'>;

const tenantMfaPath = 'me/tenant/mfa';

/**
 * Self-hosted plans: mandatory Console MFA ships with the unlaunched self-hosted Pro and Enterprise
 * plans. Removed together with the other self-hosted plans guards at launch.
 *
 * On Cloud the tenant MFA requirement is a Cloud tenant setting instead.
 */
const shouldFetchTenantMfa = !isCloud && isDevFeaturesEnabled;

/** A Ky instance for the tenant routes on `/me`, which the admin tenant serves. */
const useMeApi = () =>
  useStaticApi({ prefixUrl: adminTenantEndpoint, resourceIndicator: meApi.indicator });

/**
 * The Console MFA requirement of a self-hosted deployment: whether every member of the tenant must
 * set up MFA to sign in, and whether the current user already has.
 */
const useOssTenantMfa = () => {
  const api = useMeApi();
  const fetcher = useSwrFetcher<TenantMfa>(api);
  const { data, error, isLoading, mutate } = useSWR<TenantMfa, RequestError>(
    shouldFetchTenantMfa && tenantMfaPath,
    fetcher
  );

  const updateMfaRequirement = useCallback(
    async (isMfaRequired: boolean) => {
      const updated = await api
        .patch(tenantMfaPath, { json: { isMfaRequired } })
        .json<Pick<TenantMfa, 'isMfaRequired'>>();

      await mutate((current) => current && { ...current, ...updated }, { revalidate: false });
    },
    [api, mutate]
  );

  const getMembersWithoutMfa = useCallback(
    async () => api.get('me/tenant/members-without-mfa').json<MemberWithoutMfa[]>(),
    [api]
  );

  return { data, error, isLoading, updateMfaRequirement, getMembersWithoutMfa };
};

export default useOssTenantMfa;
