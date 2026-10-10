import useSWR from 'swr';
import { type z } from 'zod';

import {
  selfHostedLicenseDetailsGuard,
  selfHostedLicenseSummaryGuard,
} from '@/cloud/types/self-hosted-license';
import { cloudApi } from '@/consts';
import { useStaticApi } from '@/hooks/use-api';
import useCurrentUser from '@/hooks/use-current-user';

export const useSelfHostedLicenses = () => {
  const { user, error: userError } = useCurrentUser();
  // Use the existing user-token client while @logto/cloud does not yet export these routes.
  const api = useStaticApi({ resourceIndicator: cloudApi.indicator, hideErrorToast: true });
  const result = useSWR<Array<z.infer<typeof selfHostedLicenseSummaryGuard>>, Error>(
    user && !userError && ['/api/me/self-hosted-licenses', user.id],
    async () =>
      selfHostedLicenseSummaryGuard
        .array()
        .parse(await api.get('/api/me/self-hosted-licenses').json()),
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
  const api = useStaticApi({ resourceIndicator: cloudApi.indicator, hideErrorToast: true });
  const path = `/api/me/self-hosted-licenses/${encodeURIComponent(id)}`;
  const result = useSWR<z.infer<typeof selfHostedLicenseDetailsGuard>, Error>(
    user && !userError && [path, user.id],
    async () =>
      selfHostedLicenseDetailsGuard.parse(await api.get(path, { cache: 'no-store' }).json()),
    { keepPreviousData: false, revalidateOnMount: true }
  );
  return {
    ...result,
    error: userError ?? result.error,
    isLoading: (!user && !userError) || result.isLoading,
  };
};
