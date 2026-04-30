import LogtoSignature from '@experience/shared/components/LogtoSignature';
import { LogtoProvider, Prompt, ReservedScope, useLogto, UserScope } from '@logto/react';
import { accountCenterApplicationId, ExtraParamsKey, SignInIdentifier } from '@logto/schemas';
import classNames from 'classnames';
import { useContext, useEffect } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';

import AppBoundary from '@ac/Providers/AppBoundary';
import LoadingContextProvider from '@ac/Providers/LoadingContextProvider';
import PageHeader from '@ac/components/PageHeader';
import Sidebar from '@ac/components/Sidebar';
import { layoutClassNames } from '@ac/constants/layout';

import styles from './App.module.scss';
import Callback from './Callback';
import ErrorBoundary from './Providers/AppBoundary/ErrorBoundary';
import LogtoErrorBoundary from './Providers/AppBoundary/LogtoErrorBoundary';
import PageContextProvider from './Providers/PageContextProvider';
import PageContext from './Providers/PageContextProvider/PageContext';
import GlobalLoading from './components/GlobalLoading';
import { isDevFeaturesEnabled } from './constants/env';
import {
  securityRoute,
  profileRoute,
  emailRoute,
  emailSuccessRoute,
  phoneRoute,
  phoneSuccessRoute,
  passwordRoute,
  passwordSuccessRoute,
  usernameRoute,
  usernameSuccessRoute,
  authenticatorAppRoute,
  authenticatorAppReplaceRoute,
  authenticatorAppSuccessRoute,
  authenticatorAppReplaceSuccessRoute,
  backupCodesGenerateRoute,
  backupCodesRegenerateRoute,
  backupCodesSuccessRoute,
  backupCodesManageRoute,
  passkeyAddRoute,
  passkeyManageRoute,
  passkeySuccessRoute,
  socialSuccessRoute,
  socialCallbackRoutePrefix,
  socialRoutePrefix,
  verifiedActionRoute,
} from './constants/routes';
import initI18n from './i18n/init';
import { resolveUiLocalesLanguage } from './i18n/utils';
import BackupCodeBinding from './pages/BackupCodeBinding';
import BackupCodeView from './pages/BackupCodeView';
import Email from './pages/Email';
import Home from './pages/Home';
import PasskeyBinding from './pages/PasskeyBinding';
import PasskeyView from './pages/PasskeyView';
import Password from './pages/Password';
import Phone from './pages/Phone';
import Profile from './pages/Profile';
import Security from './pages/Security';
import SocialCallback from './pages/SocialCallback';
import SocialFlow from './pages/SocialFlow';
import TotpBinding from './pages/TotpBinding';
import UpdateSuccess from './pages/UpdateSuccess';
import Username from './pages/Username';
import VerifiedAction from './pages/VerifiedAction';
import {
  accountCenterBasePath,
  getUiLocales,
  handleAccountCenterRoute,
  setRouteRestore,
} from './utils/account-center-route';
import { hasVisibleSecuritySection } from './utils/security-page';
import '@experience/shared/scss/normalized.scss';

handleAccountCenterRoute();
void initI18n(resolveUiLocalesLanguage(getUiLocales()));

const redirectUri = `${window.location.origin}${accountCenterBasePath}`;

const Main = () => {
  const params = new URLSearchParams(window.location.search);
  const { pathname } = window.location;
  const isSocialCallback = pathname.startsWith(
    `${accountCenterBasePath}${socialCallbackRoutePrefix}/`
  );
  const isAuthCallback =
    Boolean(params.get('code')) &&
    (pathname === accountCenterBasePath || pathname === `${accountCenterBasePath}/`);
  const isInCallback = isSocialCallback || isAuthCallback;
  const uiLocales = getUiLocales();
  const { isAuthenticated, isLoading, signIn } = useLogto();
  const {
    accountCenterSettings,
    experienceSettings,
    isLoadingExperience,
    isLoadingUserInfo,
    userInfo,
    userInfoError,
  } = useContext(PageContext);
  const isInitialAuthLoading = !isAuthenticated && isLoading;

  useEffect(() => {
    if (isInCallback || isInitialAuthLoading || isLoadingExperience) {
      return;
    }

    if (!isAuthenticated && accountCenterSettings?.enabled) {
      const extraParams = uiLocales ? { [ExtraParamsKey.UiLocales]: uiLocales } : undefined;
      setRouteRestore(window.location.pathname);
      void signIn({ redirectUri, extraParams });
    }
  }, [
    isAuthenticated,
    isInCallback,
    isInitialAuthLoading,
    isLoadingExperience,
    accountCenterSettings,
    signIn,
    uiLocales,
  ]);

  useEffect(() => {
    if (isInCallback || isInitialAuthLoading || !isAuthenticated || isLoadingUserInfo) {
      return;
    }

    // Don't re-authenticate when account center is disabled - the API will always reject
    if (userInfoError && accountCenterSettings?.enabled) {
      const extraParams = uiLocales ? { [ExtraParamsKey.UiLocales]: uiLocales } : undefined;
      setRouteRestore(window.location.pathname);
      void signIn({ redirectUri, prompt: Prompt.Login, extraParams });
    }
  }, [
    accountCenterSettings,
    isAuthenticated,
    isInCallback,
    isInitialAuthLoading,
    isLoadingUserInfo,
    signIn,
    uiLocales,
    userInfoError,
  ]);
  if (isSocialCallback) {
    return <SocialCallback />;
  }

  if (isAuthCallback) {
    return <Callback />;
  }

  if (isInitialAuthLoading || isLoadingExperience || isLoadingUserInfo) {
    return <GlobalLoading />;
  }

  // Account center is explicitly disabled - show error page for all routes
  if (accountCenterSettings?.enabled === false) {
    return (
      <Routes>
        <Route path="*" element={<Home />} />
      </Routes>
    );
  }

  if (!userInfo) {
    return <GlobalLoading />;
  }

  const showsSecurityPage = hasVisibleSecuritySection(accountCenterSettings, experienceSettings);

  return (
    <Routes>
      <Route
        path={emailSuccessRoute}
        element={<UpdateSuccess identifierType={SignInIdentifier.Email} />}
      />
      <Route
        path={phoneSuccessRoute}
        element={<UpdateSuccess identifierType={SignInIdentifier.Phone} />}
      />
      <Route
        path={usernameSuccessRoute}
        element={<UpdateSuccess identifierType={SignInIdentifier.Username} />}
      />
      <Route path={passwordSuccessRoute} element={<UpdateSuccess identifierType="password" />} />
      <Route
        path={authenticatorAppSuccessRoute}
        element={<UpdateSuccess identifierType="totp" />}
      />
      <Route
        path={authenticatorAppReplaceSuccessRoute}
        element={<UpdateSuccess identifierType="totp_replaced" />}
      />
      <Route
        path={backupCodesSuccessRoute}
        element={<UpdateSuccess identifierType="backup_code" />}
      />
      <Route path={passkeySuccessRoute} element={<UpdateSuccess identifierType="passkey" />} />
      <Route path={socialSuccessRoute} element={<UpdateSuccess identifierType="social" />} />
      <Route path={emailRoute} element={<Email />} />
      <Route path={phoneRoute} element={<Phone />} />
      <Route path={passwordRoute} element={<Password />} />
      <Route path={usernameRoute} element={<Username />} />
      <Route path={authenticatorAppReplaceRoute} element={<TotpBinding isReplace />} />
      <Route path={authenticatorAppRoute} element={<TotpBinding />} />
      <Route path={backupCodesGenerateRoute} element={<BackupCodeBinding />} />
      <Route path={backupCodesRegenerateRoute} element={<BackupCodeBinding isRegenerate />} />
      <Route path={backupCodesManageRoute} element={<BackupCodeView />} />
      <Route path={passkeyAddRoute} element={<PasskeyBinding />} />
      <Route path={passkeyManageRoute} element={<PasskeyView />} />
      <Route path={verifiedActionRoute} element={<VerifiedAction />} />
      <Route path={`${socialCallbackRoutePrefix}/:connectorId`} element={<SocialCallback />} />
      <Route path={`${socialRoutePrefix}/:connectorId`} element={<SocialFlow mode="add" />} />
      <Route
        path={`${socialRoutePrefix}/:connectorId/remove`}
        element={<SocialFlow mode="remove" />}
      />
      {showsSecurityPage && <Route path={securityRoute} element={<Security />} />}
      {isDevFeaturesEnabled && <Route path={profileRoute} element={<Profile />} />}
      <Route index element={<Home />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
};

const Layout = () => {
  const { accountCenterSettings, experienceSettings, theme } = useContext(PageContext);
  const hideLogtoBranding = experienceSettings?.hideLogtoBranding === true;
  const { pathname } = useLocation();
  const showsSecurityPage = hasVisibleSecuritySection(accountCenterSettings, experienceSettings);
  const isSecurityFullPage = pathname === securityRoute && showsSecurityPage;
  const isProfileFullPage = pathname === profileRoute && isDevFeaturesEnabled;
  const isFullPage = isSecurityFullPage || isProfileFullPage;
  const showsSidebar = isDevFeaturesEnabled && isFullPage;

  return (
    <div className={classNames(styles.app, layoutClassNames.app)}>
      <div
        className={classNames(
          styles.layout,
          isFullPage && styles.fullPage,
          layoutClassNames.pageContainer
        )}
      >
        {isFullPage && <PageHeader />}
        <div
          className={classNames(
            styles.container,
            !isFullPage && styles.cardContainer,
            !isFullPage && layoutClassNames.cardContainer,
            showsSidebar && styles.withSidebar
          )}
        >
          {showsSidebar && <Sidebar hasProfile hasSecurity={showsSecurityPage} />}
          <main
            className={classNames(
              styles.main,
              !isFullPage && styles.cardMain,
              isFullPage ? layoutClassNames.mainContent : layoutClassNames.cardMain
            )}
          >
            <ErrorBoundary>
              <LogtoErrorBoundary>
                <Main />
              </LogtoErrorBoundary>
            </ErrorBoundary>
            {!isFullPage && !hideLogtoBranding && (
              <LogtoSignature
                className={classNames(styles.signature, layoutClassNames.signature)}
                theme={theme}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const App = () => (
  <BrowserRouter basename={accountCenterBasePath}>
    <LogtoProvider
      config={{
        endpoint: window.location.origin,
        appId: accountCenterApplicationId,
        includeReservedScopes: false,
        scopes: [
          ReservedScope.OpenId,
          UserScope.Profile,
          UserScope.Email,
          UserScope.Phone,
          UserScope.Identities,
        ],
      }}
    >
      <LoadingContextProvider>
        <PageContextProvider>
          <AppBoundary>
            <Layout />
          </AppBoundary>
        </PageContextProvider>
      </LoadingContextProvider>
    </LogtoProvider>
  </BrowserRouter>
);

export default App;
