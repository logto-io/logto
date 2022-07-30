import { User } from '@logto/schemas';
import { assert } from '@silverhand/essentials';

import {
  createUser,
  registerUserWithUsernameAndPassword,
  signInWithUsernameAndPassword,
} from '@/api';
import MockClient from '@/client';
import { generateUsername, generatePassword } from '@/utils';

export const createUserByAdmin = (_username?: string, _password?: string) => {
  const username = _username ?? generateUsername();
  const password = _password ?? generatePassword();

  return createUser({
    username,
    password,
    name: username,
  }).json<User>();
};

export const registerNewUser = async (username: string, password: string) => {
  const client = new MockClient();
  await client.initSession();

  assert(client.interactionCookie, new Error('Session not found'));

  if (!client.interactionCookie) {
    return;
  }

  const { redirectTo } = await registerUserWithUsernameAndPassword(
    username,
    password,
    client.interactionCookie
  );

  await client.processSession(redirectTo);

  assert(client.isAuthenticated, new Error('Sign in failed'));
};

export const signIn = async (username: string, password: string) => {
  const client = new MockClient();
  await client.initSession();

  assert(client.interactionCookie, new Error('Session not found'));

  if (!client.interactionCookie) {
    return;
  }

  const { redirectTo } = await signInWithUsernameAndPassword(
    username,
    password,
    client.interactionCookie
  );

  await client.processSession(redirectTo);

  assert(client.isAuthenticated, new Error('Sign in failed'));
};
