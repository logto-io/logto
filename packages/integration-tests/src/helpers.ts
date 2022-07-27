import { User } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';

import {
  createUser as createUserApi,
  registerUserWithUsernameAndPassword,
  signInWithUsernameAndPassword,
} from '@/api';
import Client from '@/client';
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
  const client = new Client({
    endpoint: logtoUrl,
    appId: demoAppApplicationId,
    persistAccessToken: false,
  });

  await client.initSession(demoAppRedirectUri);
  assert(client.interactionCookie, new Error('Session not found'));

  const username = generateUsername();
  const password = generatePassword();

  await registerUserWithUsernameAndPassword(username, password, client.interactionCookie);

  const { redirectTo } = await signInWithUsernameAndPassword(
    username,
    password,
    client.interactionCookie
  );

  await client.handleSignInCallback(redirectTo);

  assert(client.isAuthenticated, new Error('Sign in failed'));
};
