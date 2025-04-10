import { defaultSentinelPolicy, type SentinelPolicy, type SignInExperience } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

type RequiredSentinelPolicy = Required<Pick<SentinelPolicy, keyof SentinelPolicy>>;

export type GeneralFormData = {
  sentinelPolicy: RequiredSentinelPolicy;
};

export const generalFormParser = {
  fromSignInExperience: ({ sentinelPolicy }: SignInExperience): GeneralFormData => ({
    sentinelPolicy: {
      // Fallback to default values if not provided
      ...defaultSentinelPolicy,
      ...sentinelPolicy,
    },
  }),
  toSignInExperience: (formData: GeneralFormData): Pick<SignInExperience, 'sentinelPolicy'> => ({
    sentinelPolicy: formData.sentinelPolicy,
  }),
};

const useDataFetch = () => {
  const { data, error, isLoading, mutate } = useSWR<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  const formData = useMemo<GeneralFormData | undefined>(() => {
    if (!data) {
      return;
    }

    return generalFormParser.fromSignInExperience(data);
  }, [data]);

  return {
    isLoading: isLoading && !error,
    formData,
    error,
    mutate,
  };
};

export default useDataFetch;
