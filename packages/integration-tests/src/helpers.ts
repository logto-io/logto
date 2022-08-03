import fs from 'fs/promises';
import path from 'path';

import { User } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { HTTPError } from 'got';

import {
  createUser,
  registerUserWithUsernameAndPassword,
  signInWithUsernameAndPassword,
  updateConnectorConfig,
  enableConnector,
  bindWithSocial,
  getAuthWithSocial,
  signInWithSocial,
} from '@/api';
import MockClient from '@/client';
import { generateUsername, generatePassword } from '@/utils';

import { mockSocialConnectorId } from './__mocks__/connectors-mock';

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

  const { redirectTo } = await signInWithUsernameAndPassword(
    username,
    password,
    client.interactionCookie
  );

  await client.processSession(redirectTo);

  assert(client.isAuthenticated, new Error('Sign in failed'));
};

export const setUpConnector = async (connectorId: string, config: Record<string, unknown>) => {
  await updateConnectorConfig(connectorId, config);
  const connector = await enableConnector(connectorId);
  assert(connector.enabled, new Error('Connector Setup Failed'));
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

export const registerNewUserBySocial = async () => {
  const username = generateUsername();
  const password = generatePassword();

  const state = 'mock_state';
  const redirectUri = 'http://mock.com/callback';
  const code = 'mock_code';

  const client = new MockClient();

  await client.initSession();

  assert(client.interactionCookie, new Error('Session not found'));

  await signInWithSocial(
    { state, connectorId: mockSocialConnectorId, redirectUri },
    client.interactionCookie
  ).catch((error: unknown) => error);

  const response = await getAuthWithSocial(
    { connectorId: mockSocialConnectorId, data: { state, redirectUri, code } },
    client.interactionCookie
  );

  // User with social does not exist
  assert(
    response instanceof HTTPError && response.response.statusCode === 422,
    new Error('Auth with social failed')
  );

  const { redirectTo } = await signInWithUsernameAndPassword(
    username,
    password,
    client.interactionCookie
  );

  await bindWithSocial(mockSocialConnectorId, client.interactionCookie);

  await client.processSession(redirectTo);

  const { sub } = client.getIdTokenClaims();

  return sub;
};
