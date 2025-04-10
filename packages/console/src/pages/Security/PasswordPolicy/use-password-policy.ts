import { passwordPolicyGuard, type PasswordPolicy } from '@logto/core-kit';
import { type SignInExperience } from '@logto/schemas';
import { useMemo } from 'react';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

/** The parsed password policy object. All properties are required. */
export type PasswordPolicyFormData = PasswordPolicy & {
  /**
   * The custom words separated by line breaks.
   *
   * This property is only used for UI display.
   */
  customWords: string;
  /**
   * Whether the custom words feature is enabled. Default value will be true if `rejects.words` is not empty.
   *
   * This property is only used for UI display.
   */
  isCustomWordsEnabled: boolean;
};

export const passwordPolicyFormParser = {
  fromSignInExperience: ({ passwordPolicy }: SignInExperience): PasswordPolicyFormData => ({
    ...passwordPolicyGuard.parse(passwordPolicy),
    customWords: passwordPolicy.rejects?.words?.join('\n') ?? '',
    isCustomWordsEnabled: Boolean(passwordPolicy.rejects?.words?.length),
  }),
  toSignInExperience: (
    formData: PasswordPolicyFormData
  ): Pick<SignInExperience, 'passwordPolicy'> => {
    const { isCustomWordsEnabled, customWords, ...passwordPolicy } = formData;

    return {
      passwordPolicy: {
        ...passwordPolicy,
        rejects: {
          ...passwordPolicy.rejects,
          words: isCustomWordsEnabled ? customWords.split('\n').filter(Boolean) : [],
        },
      },
    };
  },
};

const usePasswordPolicy = () => {
  const { data, error, isLoading, mutate } = useSWR<SignInExperience, RequestError>(
    'api/sign-in-exp'
  );

  const formData = useMemo<PasswordPolicyFormData | undefined>(() => {
    if (!data) {
      return;
    }

    return passwordPolicyFormParser.fromSignInExperience(data);
  }, [data]);

  return {
    isLoading: isLoading && !error,
    mutate,
    error,
    data: formData,
  };
};

export default usePasswordPolicy;
