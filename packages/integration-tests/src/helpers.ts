import { User } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';

import {
  visitSignInUri,
  registerUserWithUsernameAndPassword,
  consentUserAndGetSignInCallbackUri,
  signInWithUsernameAndPassword,
} from './actions';
import { createUser as createUserApi } from './api';
import LogtoClient from './client/logto-client';
import { demoAppRedirectUri, logtoUrl } from './constants';
import { generateUsername, generatePassword } from './utils';

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

  await logtoClient.signIn(demoAppRedirectUri);

  assert(logtoClient.navigateUrl, new Error('Unable to navigate to sign in uri'));

  const interactionCookie = await visitSignInUri(logtoClient.navigateUrl);

  const username = generateUsername();
  const password = generatePassword();

  await registerUserWithUsernameAndPassword(username, password, interactionCookie);

  const interactionCookieWithSession = await signInWithUsernameAndPassword(
    username,
    password,
    interactionCookie
  );

  const signInCallbackUri = await consentUserAndGetSignInCallbackUri(interactionCookieWithSession);

  await logtoClient.handleSignInCallback(signInCallbackUri);

  assert(logtoClient.isAuthenticated, new Error('Sign in failed'));
};
