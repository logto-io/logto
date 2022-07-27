import { User } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';

import {
  createUser as createUserApi,
  registerUserWithUsernameAndPassword,
  signInWithUsernameAndPassword,
} from '@/api';
import LogtoClient from '@/client';
import { demoAppRedirectUri, logtoUrl } from '@/constants';
import { generateUsername, generatePassword } from '@/utils';

export const createUser = () => {
  const username = generateUsername();
  const password = generatePassword();

  return createUserApi({
    username,
    password,
    name: username,
  }).json<User>();
};

export const registerUserAndSignIn = async () => {
  const logtoClient = new LogtoClient({
    endpoint: logtoUrl,
    appId: demoAppApplicationId,
    persistAccessToken: false,
  });

  await logtoClient.initSession(demoAppRedirectUri);
  assert(logtoClient.interactionCookie, new Error('Session not found'));

  const username = generateUsername();
  const password = generatePassword();

  await registerUserWithUsernameAndPassword(username, password, logtoClient.interactionCookie);

  const { redirectTo } = await signInWithUsernameAndPassword(
    username,
    password,
    logtoClient.interactionCookie
  );

  await logtoClient.handleSignInCallback(redirectTo);

  assert(logtoClient.isAuthenticated, new Error('Sign in failed'));
};
