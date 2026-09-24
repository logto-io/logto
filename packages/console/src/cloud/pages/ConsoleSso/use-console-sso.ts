import { type consoleSsoRouter } from '@logto/cloud/routes';
import { type ResponseError } from '@withtyped/client';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type ConsoleSsoConnector } from '@/cloud/types/router';
import useCurrentUser from '@/hooks/use-current-user';

export const useConsoleSsoConnectors = () => {
  const { user, error: userError } = useCurrentUser();
  const api = useCloudApi<typeof consoleSsoRouter>({ hideErrorToast: true });
  const result = useSWR<ConsoleSsoConnector[], ResponseError>(
    user && !userError && ['/api/me/console-sso/connectors', user.id],
    async () => api.get('/api/me/console-sso/connectors'),
    { keepPreviousData: false }
  );
  return { ...result, data: userError ? undefined : result.data, error: userError ?? result.error };
};
