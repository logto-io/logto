import type { GetUserApplicationGrantsResponse } from '@logto/schemas';
import { normalizeUserApplicationGrantGroups } from '@logto/shared/universal';
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
    return normalizeUserApplicationGrantGroups(data?.grants ?? []).map(
      ({ id, applicationId, iat, grantIds }) => ({
        id,
        applicationId,
        createdAt: new Date(iat * 1000).toLocaleString(i18n.language),
        grantIds,
      })
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
