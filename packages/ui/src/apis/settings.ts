/**
 * Used to get and general sign-in experience settings.
 * The API will be deprecated in the future once SSR is implemented.
 */

import { SignInExperience } from '@logto/schemas';
import ky from 'ky';

export const getSignInExperience = async <T extends SignInExperience>(): Promise<T> => {
  return ky.get('/api/.well-known/sign-in-exp').json<T>();
};
