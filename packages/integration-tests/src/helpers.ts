import fs from 'fs/promises';
import path from 'path';

import type { User, SignIn, SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import {
  createUser,
  registerUserWithUsernameAndPassword,
  signInWithPassword,
  bindWithSocial,
  getAuthWithSocial,
  signInWithSocial,
  updateSignInExperience,
} from '#src/api/index.js';
import MockClient from '#src/client/index.js';
import { generateUsername, generatePassword } from '#src/utils.js';

export const createUserByAdmin = (username?: string, password?: string, primaryEmail?: string) => {
  return createUser({
    username: username ?? generateUsername(),
    password: password ?? generatePassword(),
    name: username ?? 'John',
    primaryEmail,
  }).json<User>();
};

export const registerNewUser = async (username: string, password: string) => {
  const client = new MockClient();
  await client.initSession();

  assert(client.interactionCookie, new Error('Session not found'));

  const { redirectTo } = await registerUserWithUsernameAndPassword(
    username,
    password,
    client.interactionCookie
  );

  await client.processSession(redirectTo);

  assert(client.isAuthenticated, new Error('Sign in failed'));
};

export type SignInHelper = {
  username?: string;
  email?: string;
  password: string;
};

export const signIn = async ({ username, email, password }: SignInHelper) => {
  const client = new MockClient();
  await client.initSession();

  assert(client.interactionCookie, new Error('Session not found'));

  const { redirectTo } = await signInWithPassword({
    username,
    email,
    password,
    interactionCookie: client.interactionCookie,
  });

  await client.processSession(redirectTo);

  assert(client.isAuthenticated, new Error('Sign in failed'));
};

export const setSignUpIdentifier = async (
  identifiers: SignInIdentifier[],
  password = true,
  verify = true
) => {
  await updateSignInExperience({ signUp: { identifiers, password, verify } });
};

export const setSignInMethod = async (methods: SignIn['methods']) => {
  await updateSignInExperience({
    signIn: {
      methods,
    },
  });
};

type PasscodeRecord = {
  phone?: string;
  address?: string;
  code: string;
  type: string;
};

export const readPasscode = async (): Promise<PasscodeRecord> => {
  const buffer = await fs.readFile(path.join('/tmp', 'logto_mock_passcode_record.txt'));
  const content = buffer.toString();

  // For test use only
  // eslint-disable-next-line no-restricted-syntax
  return JSON.parse(content) as PasscodeRecord;
};

export const bindSocialToNewCreatedUser = async (connectorId: string) => {
  const username = generateUsername();
  const password = generatePassword();

  await createUserByAdmin(username, password);

  const state = 'mock_state';
  const redirectUri = 'http://mock.com/callback';
  const code = 'mock_code';

  const client = new MockClient();

  await client.initSession();
  assert(client.interactionCookie, new Error('Session not found'));

  await signInWithSocial({ state, connectorId, redirectUri }, client.interactionCookie);

  const response = await getAuthWithSocial(
    { connectorId, data: { state, redirectUri, code } },
    client.interactionCookie
  ).catch((error: unknown) => error);

  // User with social does not exist
  assert(
    response instanceof HTTPError && response.response.statusCode === 422,
    new Error('Auth with social failed')
  );

  const { redirectTo } = await signInWithPassword({
    username,
    password,
    interactionCookie: client.interactionCookie,
  });

  await bindWithSocial(connectorId, client.interactionCookie);

  await client.processSession(redirectTo);

  const { sub } = await client.getIdTokenClaims();

  return sub;
};
