import fs from 'fs/promises';
import path from 'path';

import type { User, SignUpIdentifier, SignIn } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import {
  createUser,
  registerUserWithUsernameAndPassword,
  signInWithPassword,
  updateConnectorConfig,
  enableConnector,
  bindWithSocial,
  getAuthWithSocial,
  postConnector,
  signInWithSocial,
  updateSignInExperience,
} from '@/api';
import MockClient from '@/client';
import { generateUsername, generatePassword } from '@/utils';

import { mockSocialConnectorId } from './__mocks__/connectors-mock';

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

export const setUpConnector = async (connectorId: string, config: Record<string, unknown>) => {
  try {
    await updateConnectorConfig(connectorId, config);
  } catch {
    await postConnector(connectorId);
    await updateConnectorConfig(connectorId, config);
  }
  const connector = await enableConnector(connectorId);
  assert(connector.enabled, new Error('Connector Setup Failed'));
};

export const setSignUpIdentifier = async (
  identifier: SignUpIdentifier,
  password = true,
  verify = true
) => {
  await updateSignInExperience({ signUp: { identifier, password, verify } });
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

export const bindSocialToNewCreatedUser = async () => {
  const username = generateUsername();
  const password = generatePassword();

  await createUserByAdmin(username, password);

  const state = 'mock_state';
  const redirectUri = 'http://mock.com/callback';
  const code = 'mock_code';

  const client = new MockClient();

  await client.initSession();
  assert(client.interactionCookie, new Error('Session not found'));

  await signInWithSocial(
    { state, connectorId: mockSocialConnectorId, redirectUri },
    client.interactionCookie
  );

  const response = await getAuthWithSocial(
    { connectorId: mockSocialConnectorId, data: { state, redirectUri, code } },
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

  await bindWithSocial(mockSocialConnectorId, client.interactionCookie);

  await client.processSession(redirectTo);

  const { sub } = await client.getIdTokenClaims();

  return sub;
};
