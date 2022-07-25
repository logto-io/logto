import { LogtoConfig } from '@logto/node';
import { demoAppApplicationId } from '@logto/schemas/lib/seeds';

import LogtoClient from '@/client/logto-client';
import { demoAppRedirectUri, logtoUrl } from '@/constants';
import {
  consentUserAndGetSignInCallbackUri,
  registerUserWithUsernameAndPassword,
  signInWithUsernameAndPassword,
  visitSignInUri,
} from '@/ui-actions';
import { generatePassword, generateUsername } from '@/utils';

describe('username and password flow', () => {
  it('should register and sign in with username and password successfully', async () => {
    const logtoConfig: LogtoConfig = {
      endpoint: logtoUrl,
      appId: demoAppApplicationId,
      persistAccessToken: false,
    };

    const logtoClient = new LogtoClient(logtoConfig);

    await logtoClient.signIn(demoAppRedirectUri);

    expect(logtoClient.navigateUrl).toBeTruthy();

    const interactionCookie = await visitSignInUri(logtoClient.navigateUrl);

    const username = generateUsername();
    const password = generatePassword();

    await registerUserWithUsernameAndPassword(username, password, interactionCookie);

    const interactionCookieWithSession = await signInWithUsernameAndPassword(
      username,
      password,
      interactionCookie
    );

    const signInCallbackUri = await consentUserAndGetSignInCallbackUri(
      interactionCookieWithSession
    );

    await logtoClient.handleSignInCallback(signInCallbackUri);

    expect(logtoClient.isAuthenticated).toBeTruthy();
  });
});
