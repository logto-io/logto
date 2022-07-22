import {
  doConsentAndCompleteAuth,
  doFetchOidcConfig,
  doHandleCallbackUriAndFetchToken,
  doRegisterWithUsernamePassword,
  doSignInWithUsernamePassword,
  doVisitAuthorizationEndpointAndGetCookie,
} from '@/user-sign-in/actions';

import { UserSignInContext } from '../src/user-sign-in';

describe('username and password flow', () => {
  const userSignInContext = new UserSignInContext();

  beforeAll(async () => {
    await userSignInContext.init();
  });

  it('should fetch OIDC configuration successfully', async () => {
    await doFetchOidcConfig(userSignInContext);
  });

  it('should visit authorization endpoint successfully', async () => {
    await doVisitAuthorizationEndpointAndGetCookie(userSignInContext);
  });

  it('should register with username and password successfully', async () => {
    await doRegisterWithUsernamePassword(userSignInContext);
  });

  it('should sign in with username and password successfully', async () => {
    await doSignInWithUsernamePassword(userSignInContext);
  });

  it('should consent and complete the auth process successfully', async () => {
    await doConsentAndCompleteAuth(userSignInContext);
  });

  it('should handle callback uri and fetch token successfully', async () => {
    await doHandleCallbackUriAndFetchToken(userSignInContext);
  });
});
