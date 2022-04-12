/**
 * Used to get and general sign-in experience settings.
 * The API will be depreated in the future once SSR is implemented.
 */

import { SignInExperience } from '@logto/schemas';
import ky from 'ky';

export const getSignInExperience = async () => {
  return ky.get('/api/sign-in-settings').json<SignInExperience>();
};
