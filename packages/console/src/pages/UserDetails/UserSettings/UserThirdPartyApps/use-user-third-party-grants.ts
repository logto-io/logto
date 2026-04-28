import type { GetUserApplicationGrantsResponse } from '@logto/schemas';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

import useApi, { type RequestError } from '@/hooks/use-api';

export type GrantedThirdPartyAppRow = {
  id: string;
  applicationId: string;
  createdAt: string;
  grantIds: string[];
};

function useUserThirdPartyGrants(userId: string) {
  const { i18n } = useTranslation();
  const api = useApi();
  const [removingApplicationId, setRemovingApplicationId] = useState<string>();
  const { data, isLoading, error, mutate } = useSWR<GetUserApplicationGrantsResponse, RequestError>(
    `api/users/${userId}/grants?appType=thirdParty`
  );

  const rowData = useMemo<GrantedThirdPartyAppRow[]>(() => {
    const grants = data?.grants ?? [];

    const groupedByApplicationId = new Map<string, { iat: number; grantIds: string[] }>();

    for (const grant of grants) {
      const group = groupedByApplicationId.get(grant.payload.clientId);

      if (!group) {
        groupedByApplicationId.set(grant.payload.clientId, {
          iat: grant.payload.iat,
          grantIds: [grant.id],
        });
        continue;
      }

      groupedByApplicationId.set(grant.payload.clientId, {
        // The createdAt of the app should be the earliest iat among its grants
        iat: Math.min(group.iat, grant.payload.iat),
        grantIds: [...group.grantIds, grant.id],
      });
    }

    return Array.from(groupedByApplicationId.entries())
      .map(([applicationId, group]) => ({
        id: applicationId,
        applicationId,
        createdAt: new Date(group.iat * 1000).toLocaleString(i18n.language),
        grantIds: group.grantIds,
      }))
      .slice()
      .sort(
        (previous, next) =>
          new Date(next.createdAt).getTime() - new Date(previous.createdAt).getTime()
      );
  }, [data?.grants, i18n.language]);

  const removeByApplication = useCallback(
    async (app: GrantedThirdPartyAppRow) => {
      setRemovingApplicationId(app.applicationId);

      try {
        await Promise.allSettled(
          app.grantIds.map(async (grantId) => api.delete(`api/users/${userId}/grants/${grantId}`))
        );
        await mutate();
      } finally {
        setRemovingApplicationId(undefined);
      }
    },
    [api, mutate, userId]
  );

  return {
    rowData,
    hasRows: rowData.length > 0,
    isLoading,
    error,
    mutate,
    removingApplicationId,
    removeByApplication,
  };
}

export default useUserThirdPartyGrants;
