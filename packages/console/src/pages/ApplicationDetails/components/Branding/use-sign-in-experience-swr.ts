import { type SignInExperience } from '@logto/schemas';
import useSWR from 'swr';

import { type RequestError } from '@/hooks/use-api';

/**
 * We need SIE isDarkModeEnabled to determine if we should show the dark mode logo forms
 */
const useSignInExperienceSWR = () => {
  return useSWR<SignInExperience, RequestError>('api/sign-in-exp');
};

export default useSignInExperienceSWR;
