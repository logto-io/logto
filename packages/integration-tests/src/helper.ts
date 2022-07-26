import { User } from '@logto/schemas';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';
import { assert } from '@silverhand/essentials';

import { authedAdminApi } from './api';
import LogtoClient from './client/logto-client';
import { demoAppRedirectUri, logtoUrl } from './constants';
import {
  visitSignInUri,
  registerUserWithUsernameAndPassword,
  consentUserAndGetSignInCallbackUri,
  signInWithUsernameAndPassword,
} from './ui-actions';
import { generateUsername, generatePassword } from './utils';

export const createUser = () => {
  const username = generateUsername();

  return authedAdminApi
    .post('users', {
      json: {
        username,
        password: generatePassword(),
        name: username,
      },
    })
    .json<User>();
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
