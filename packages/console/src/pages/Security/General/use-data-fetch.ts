import { defaultSentinelPolicy, type SentinelPolicy, type SignInExperience } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

type RequiredSentinelPolicy = Required<Pick<SentinelPolicy, keyof SentinelPolicy>>;

export type GeneralFormData = {
  sentinelPolicyEnabled: boolean; // Can be true or false
  sentinelPolicy: RequiredSentinelPolicy; // Optional, but will be required if sentinelPolicyEnabled is true
};

export const generalFormParser = {
  /**
   * @remarks
   * The {@link SentinelPolicy} is a required field in the SignInExperience schema.
   * The default value is an empty object.
   *
   * If the object is empty, it is treated as disabled.
   * If it contains properties, it is treated as enabled.
   *
   */
  fromSignInExperience: ({ sentinelPolicy }: SignInExperience): GeneralFormData => {
    const sentinelPolicyEnabled = Object.keys(sentinelPolicy).length > 0;

    return {
      sentinelPolicyEnabled,
      /** @remarks
       * Since all the properties are optional, for form display purposes, if the sentinelPolicy is enabled (not empty),
       * we always merge it with the default value, (makes all the properties required).
       * If the sentinelPolicy is disabled (empty), we return the default value.
       *
       * So that the form can always display all the properties values correctly.
       */
      sentinelPolicy: sentinelPolicyEnabled
        ? {
            ...defaultSentinelPolicy,
            ...sentinelPolicy,
          }
        : defaultSentinelPolicy,
    };
  },
  toSignInExperience: (formData: GeneralFormData): Pick<SignInExperience, 'sentinelPolicy'> => {
    const { sentinelPolicyEnabled, sentinelPolicy } = formData;

    if (!sentinelPolicyEnabled) {
      return {
        sentinelPolicy: {},
      };
    }

    return {
      sentinelPolicy,
    };
  },
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
