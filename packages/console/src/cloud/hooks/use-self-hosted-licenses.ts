import { type selfHostedLicensesRouter } from '@logto/cloud/routes';
import useSWR from 'swr';

import { useCloudApi } from '@/cloud/hooks/use-cloud-api';
import { type SelfHostedLicenseSummary } from '@/cloud/types/router';
import { isCloud } from '@/consts/env';
import useCurrentUser from '@/hooks/use-current-user';

export const useSelfHostedLicenses = () => {
  const { user, error: userError } = useCurrentUser();
  const api = useCloudApi<typeof selfHostedLicensesRouter>({ hideErrorToast: true });
  const result = useSWR<SelfHostedLicenseSummary[], Error>(
    isCloud && user && !userError && ['/api/me/self-hosted-licenses', user.id],
    async () => api.get('/api/me/self-hosted-licenses'),
    { keepPreviousData: false }
  );
  return {
    ...result,
    error: userError ?? result.error,
    isLoading: (!user && !userError) || result.isLoading,
  };
};

export const useSelfHostedLicense = (id: string) => {
  const { user, error: userError } = useCurrentUser();
  const api = useCloudApi<typeof selfHostedLicensesRouter>({ hideErrorToast: true });
  const result = useSWR<SelfHostedLicenseSummary, Error>(
    user && !userError && ['/api/me/self-hosted-licenses/:id', user.id, id],
    async () => api.get('/api/me/self-hosted-licenses/:id', { params: { id } }),
    { keepPreviousData: false, revalidateOnMount: true }
  );
  return {
    ...result,
    userId: user?.id,
    error: userError ?? result.error,
    isLoading: (!user && !userError) || result.isLoading,
  };
};
