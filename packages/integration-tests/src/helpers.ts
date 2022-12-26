import fs from 'fs/promises';
import { createServer } from 'http';
import path from 'path';

import type { User, SignIn, SignInIdentifier } from '@logto/schemas';
import { assert } from '@silverhand/essentials';
import { HTTPError, RequestError } from 'got';

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

import { enableAllPasswordSignInMethods } from './tests/api/interaction/utils/sign-in-experience.js';

export const createUserByAdmin = (
  username?: string,
  password?: string,
  primaryEmail?: string,
  primaryPhone?: string,
  name?: string,
  isAdmin = false
) => {
  return createUser({
    username: username ?? generateUsername(),
    password,
    name: name ?? username ?? 'John',
    primaryEmail,
    primaryPhone,
    isAdmin,
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

  await enableAllPasswordSignInMethods();
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

export const expectRejects = async (
  promise: Promise<unknown>,
  code: string,
  messageIncludes?: string
) => {
  try {
    await promise;
  } catch (error: unknown) {
    expectRequestError(error, code, messageIncludes);

    return;
  }

  fail();
};

export const expectRequestError = (error: unknown, code: string, messageIncludes?: string) => {
  if (!(error instanceof RequestError)) {
    fail('Error should be an instance of RequestError');
  }

  // JSON.parse returns `any`. Directly use `as` since we've already know the response body structure.
  // eslint-disable-next-line no-restricted-syntax
  const body = JSON.parse(String(error.response?.body)) as {
    code: string;
    message: string;
  };

  expect(body.code).toEqual(code);

  if (messageIncludes) {
    expect(body.message.includes(messageIncludes)).toBeTruthy();
  }
};

export const createMockServer = (port: number) => {
  const server = createServer((request, response) => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    response.statusCode = 204;
    response.end();
  });

  return {
    listen: async () =>
      new Promise((resolve) => {
        server.listen(port, () => {
          resolve(true);
        });
      }),
    close: async () =>
      new Promise((resolve) => {
        server.close(() => {
          resolve(true);
        });
      }),
  };
};
