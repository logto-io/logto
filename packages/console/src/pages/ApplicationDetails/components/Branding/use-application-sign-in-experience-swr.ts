import { type ApplicationSignInExperience } from '@logto/schemas';
import useSWR from 'swr';

import useApi, { RequestError } from '@/hooks/use-api';
import useSwrFetcher from '@/hooks/use-swr-fetcher';

/**
 * SWR fetcher for application sign-in experience
 *
 * hide error toast, because we will handle the error in the component
 * allow 404 error, if the sign-in experience is not set
 */
const useApplicationSignInExperienceSWR = (applicationId: string) => {
  const fetchApi = useApi({ hideErrorToast: true });
  const fetcher = useSwrFetcher<ApplicationSignInExperience>(fetchApi);

  return useSWR<ApplicationSignInExperience, RequestError>(
    `api/applications/${applicationId}/sign-in-experience`,
    {
      fetcher,
      shouldRetryOnError: (error: unknown) => {
        if (error instanceof RequestError) {
          return error.status !== 404;
        }

        return true;
      },
    }
  );
};

export default useApplicationSignInExperienceSWR;
